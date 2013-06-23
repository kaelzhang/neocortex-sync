'use strict';

var mysql = require('mysql-wrapper');

// start connection
module.exports = mysql({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'test',
    // debug: true
});