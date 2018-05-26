'use strict';

exports.keys = '123456';

exports.apiAuth = {
  clients: [
    {
      clientID: 'test0',
      accessKey: 'xnxnxnx110nxnxnxn',
    }, {
      clientID: 'test1',
      accessKey: 'xnxnx22nxnxnxnxn111',
      allowPaths: [ '/p1', '/p1/**' ],
    }, {
      clientID: 'test2',
      accessKey: 'xnxn22xnxnxnxnxn111',
      // allowPaths:'/p1/*',
      denyPaths: [ '/p3', '/p4' ],
    },
  ],
};

