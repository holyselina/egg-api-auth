'use strict';

const mock = require('egg-mock');
const moment = require('moment');
const { signParams } = require('..');
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

  it('ignore auth', () => {
    return app.httpRequest()
      .get('/ignore')
      .expect(200);
  });

  it('not auth', () => {
    return app.httpRequest()
      .get('/')
      .expect(401);
  });

  it('simple', () => {
    const ctx = app.mockContext();
    const c = ctx.app.config.apiAuth.clients[3];
    const params = {
      clientID: c.clientID,
      type: c.type,
      accessKey: c.accessKey,
      nonce: Math.random(),
    };
    return app.httpRequest()
      .get('/').query(params)
      .expect(200);
  });

  it('pass auth', () => {
    const ctx = app.mockContext();
    const c = ctx.app.config.apiAuth.clients[0];
    const params = {
      clientID: c.clientID,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), // new Date().getTime(),
      timestampFormat: 'YYYY-MM-DD HH:mm:ss',
      nonce: Math.random(),
    };
    // const sign = ctx.helper.signMd5(params, c.accessKey);
    signParams(params, c.accessKey);
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
    // const sign = ctx.helper.signMd5(params, c.accessKey);
    signParams(params, c.accessKey);
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
    // const sign = ctx.helper.signMd5(params, c.accessKey);
    signParams(params, c.accessKey);
    return app.httpRequest()
      .get('/').query(params)
      .expect(401);
  });

  it('allowPaths', async () => {
    const ctx = app.mockContext();
    const c = ctx.app.config.apiAuth.clients[1];
    const params = {
      clientID: c.clientID,
      timestamp: new Date().getTime(),
      nonce: Math.random(),
    };
    // const sign = ctx.helper.signMd5(params, c.accessKey);
    signParams(params, c.accessKey);
    await app.httpRequest()
      .get('/p2').query(params)
      .expect(401);
    await app.httpRequest()
      .get('/p3').query(params)
      .expect(401);
    await app.httpRequest()
      .get('/p1').query(params)
      .expect(200);
    await app.httpRequest()
      .get('/p1/p1').query(params)
      .expect(200);
  });

  it('denyPaths', async () => {
    const ctx = app.mockContext();
    const c = ctx.app.config.apiAuth.clients[2];
    const params = {
      clientID: c.clientID,
      timestamp: new Date().getTime(),
      nonce: Math.random(),
    };
    // const sign = ctx.helper.signMd5(params, c.accessKey);
    signParams(params, c.accessKey);
    await app.httpRequest()
      .get('/p3').query(params)
      .expect(401);
    await app.httpRequest()
      .get('/p4').query(params)
      .expect(401);
    await app.httpRequest()
      .get('/p1').query(params)
      .expect(200);
    await app.httpRequest()
      .get('/p1/p1').query(params)
      .expect(200);
  });

});
