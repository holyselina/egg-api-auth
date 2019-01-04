'use strict';

/**
 * egg-api-auth default config
 * @member Config#apiAuth
 * @property {String} SOME_KEY - some description
 */
exports.apiAuth = {
  signKey: 'sign',
  errorStatus: 401,
  timestampLimit: 600000,
  clients: [],
  ignorePaths: null,
  timestampFormat: null,
};
