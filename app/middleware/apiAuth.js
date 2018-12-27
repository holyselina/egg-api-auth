'use strict';
const minimatch = require('minimatch');
module.exports = options => {
  return async function(ctx, next) {
    if (ctx.authedClient) {
      return await next();
    }
    const { ignorePaths, clients, signKey, nonceStore, errorStatus, timestampLimit, log } = options;
    if (ignorePaths) {
      for (const inp of typeof ignorePaths === 'string' ? [ ignorePaths ] : ignorePaths) {
        if (minimatch(ctx.path, inp)) {
          return await next();
        }
      }
    }
    const params = ctx.helper.getSignParams();
    if (!params.clientID || !params[signKey] || !params.timestamp) {
      ctx.throw(errorStatus, 'auth params lost');
    }
    const [ client ] = clients.filter(c => c.clientID === params.clientID);
    if (!client) {
      ctx.throw(errorStatus, 'clientID error');
    }
    if (!ctx.helper.validateSign(params, client.accessKey)) {
      ctx.throw(errorStatus, 'sign error');
    }
    const tp = parseInt(params.timestamp);
    if (isNaN(tp)) {
      ctx.throw(errorStatus, 'timestamp error');
    }
    const diff = new Date().getTime() - tp;
    if (diff > timestampLimit || diff < -timestampLimit) {
      ctx.throw(errorStatus, 'timestampLimit error');
    }
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
