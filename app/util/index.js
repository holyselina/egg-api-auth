'use strict';
const crypto = require('crypto');

function stringifyParams(params) {
  return Object.keys(params).sort().map(x => x + '=' + params[x])
    .join('&');
}

function signMd5(str, key) {
  return crypto.createHash('md5').update(Buffer.from(str + key)).digest('hex')
    .toUpperCase();
}

function getSignParams(ctx) {
  return Object.assign({}, ctx.query, ctx.request.body, ctx.params);
}

function sign(str, key) {
  return signMd5(str, key);
}

function signParams(params, key, signField = 'sign') {
  params[signField] = sign(stringifyParams(params), key);
  return params;
}

module.exports = {
  stringifyParams, signMd5, getSignParams, sign, signParams,
};
