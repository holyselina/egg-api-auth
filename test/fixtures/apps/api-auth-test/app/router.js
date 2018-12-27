'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.get('/', controller.home.index);

  router.get('/p1', controller.home.index);

  router.get('/p1/p1', controller.home.index);

  router.get('/p2', controller.home.index);

  router.get('/p3', controller.home.index);

  router.get('/p4', controller.home.index);

  router.get('/ignore', controller.home.index);
};
