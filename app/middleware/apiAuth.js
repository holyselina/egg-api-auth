'use strict';
const minimatch = require('minimatch');
const moment = require('moment');
const util = require('../util');

const checkers = {
  md5(ctx, client, params, options) {
    const { signKey, timestampFormat, errorStatus, timestampLimit } = options;
    if (!params[signKey] || !params.timestamp) {
      ctx.throw(errorStatus, 'auth params lost');
    }
    const { stringifyParams, sign } = util;
    const signVal = params[signKey];
    delete params[signKey];
    const strParams = stringifyParams(params);
    if (sign(strParams, client.accessKey) !== signVal) {
      ctx.throw(errorStatus, 'sign error');
    }
    let tp,
      tf = params.timestampFormat || timestampFormat;
    if (tf === 'number') {
      tf = null;
    }
    if (!tf) {
      tp = parseInt(params.timestamp);
      if (isNaN(tp)) {
        ctx.throw(errorStatus, 'timestamp error');
      }
    } else {
      tp = moment(params.timestamp, tf);
      if (!tp.isValid()) {
        ctx.throw(errorStatus, 'timestamp error');
      }
      tp = tp.valueOf();
    }
    const diff = new Date().getTime() - tp;
    if (diff > timestampLimit || diff < -timestampLimit) {
      ctx.throw(errorStatus, 'timestampLimit error');
    }
  },
  simple(ctx, client, params, options) {
    const { errorStatus } = options;
    if (!params.accessKey) {
      ctx.throw(errorStatus, 'accessKey lost');
    }
    if (client.accessKey !== params.accessKey) {
      ctx.throw(errorStatus, 'accessKey error');
    }
  },
};

module.exports = options => {
  const { signUtil = {} } = options;
  Object.assign(util, signUtil);
  return async function(ctx, next) {
    if (ctx.authedClient) {
      return await next();
    }
    const { includedPaths, ignorePaths, clients, nonceStore, errorStatus, log, findClient } = options;
    if (includedPaths) {
      let match = false;
      for (const inp of typeof includedPaths === 'string' ? [ includedPaths ] : includedPaths) {
        if (minimatch(ctx.path, inp)) {
          match = true;
          break;
        }
      }
      if (!match) {
        return await next();
      }
    } else if (ignorePaths) {
      for (const inp of typeof ignorePaths === 'string' ? [ ignorePaths ] : ignorePaths) {
        if (minimatch(ctx.path, inp)) {
          return await next();
        }
      }
    }
    const { getSignParams } = util;
    const params = getSignParams(ctx);
    if (!params.clientID) {
      ctx.throw(errorStatus, 'clientID lost');
    }
    const client = await findClient(ctx, params.clientID, clients); // clients.filter(c => c.clientID === params.clientID);
    if (!client) {
      ctx.throw(errorStatus, 'clientID error');
    }
    const type = client.type || 'md5';
    const checker = checkers[type];
    if (!checker) {
      ctx.throw(errorStatus, 'type error');
    }
    checker(ctx, client, params, options);
    if (nonceStore && nonceStore.check && nonceStore.add) {
      if (await nonceStore.check(ctx, params.nonce, client) !== true) {
        ctx.throw(errorStatus, 'nonce repeat');
      }
      await nonceStore.add(ctx, params.nonce, client);
    }
    let dps = client.denyPaths;
    if (dps) {
      if (!Array.isArray(dps)) {
        dps = [ dps ];
      }
      for (const dp of dps) {
        if (minimatch(ctx.path, dp)) {
          ctx.throw(errorStatus, 'not path auth');
        }
      }
    }
    let aps = client.allowPaths;
    if (aps) {
      if (!Array.isArray(aps)) {
        aps = [ aps ];
      }
      let match = false;
      for (const ap of aps) {
        if (match) {
          break;
        }
        if (minimatch(ctx.path, ap)) {
          match = true;
        }
      }
      if (!match) {
        ctx.throw(errorStatus, 'not path auth');
      }
    }
    ctx.authedClient = client;
    if (typeof log === 'function') {
      await log(ctx, client);
    }
    await next();
  };
};
