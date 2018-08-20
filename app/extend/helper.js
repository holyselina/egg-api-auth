'use strict';
const crypto = require('crypto');
module.exports = {
  stringifyParams(params) {
    return Object.keys(params).sort().map(x => x + '=' + params[x])
      .join('&');
  },
  signMd5(params, key) {
    return crypto.createHash('md5').update(new Buffer(this.stringifyParams(params) + key)).digest('hex')
      .toUpperCase();
  },
  getSignParams() {
    return Object.assign({}, this.ctx.query, this.ctx.request.body, this.ctx.params);
  },
  validateSign(params, key) {
    params = Object.assign({}, params);
    const { signKey } = this.app.config.apiAuth;
    const sign = params[signKey];
    delete params[signKey];
    return this.signMd5(params, key) === sign;
  },
};
