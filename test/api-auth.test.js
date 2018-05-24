'use strict';

const mock = require('egg-mock');

describe('test/api-auth.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/api-auth-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('not auth', () => {
    return app.httpRequest()
      .get('/')
      .expect(401);
  });

  it('pass auth', () => {
    const ctx = app.mockContext();
    const c = ctx.app.config.apiAuth.clients[0];
    const params = {
      clientID: c.clientID,
      timestamp: new Date().getTime(),
      nonce: Math.random(),
    };
    const sign = ctx.helper.signMd5(params, c.accessKey);
    params.sign = sign;
    return app.httpRequest()
      .get('/').query(params)
      .expect(200);
  });

  it('timestamp early', () => {
    const ctx = app.mockContext();
    const c = ctx.app.config.apiAuth.clients[0];
    const params = {
      clientID: c.clientID,
      timestamp: new Date().getTime() - ctx.app.config.apiAuth.timestampLimit - 1000,
      nonce: Math.random(),
    };
    const sign = ctx.helper.signMd5(params, c.accessKey);
    params.sign = sign;
    return app.httpRequest()
      .get('/').query(params)
      .expect(401);
  });

  it('timestamp later', () => {
    const ctx = app.mockContext();
    const c = ctx.app.config.apiAuth.clients[0];
    const params = {
      clientID: c.clientID,
      timestamp: new Date().getTime() + ctx.app.config.apiAuth.timestampLimit + 1000,
      nonce: Math.random(),
    };
    const sign = ctx.helper.signMd5(params, c.accessKey);
    params.sign = sign;
    return app.httpRequest()
      .get('/').query(params)
      .expect(401);
  });
});
