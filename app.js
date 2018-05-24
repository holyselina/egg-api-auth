'use strict';
module.exports = app => {
  app.config.appMiddleware.push('apiAuth');
};
