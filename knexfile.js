module.exports = {

  development: {
    client: 'mysql',
    connection: 'mysql://root@localhost/tsnode_test',
    debug: false,
    pool: {
      min: 2,
      max: 50
    },
    acquireConnectionTimeout: 5000
  }
};
