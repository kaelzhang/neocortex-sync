'use strict';

// module: mysql wrapper

var mysql = require('mysql');
var conn = module.exports = {};


conn.createConnection = function(options) {
    if(!conn.connected){
        conn.connected = true;

        if(options){
            conn.options = options;
        }

        conn.connection = mysql.createConnection(conn.options);
    }
};


// never run `connect` and `end` method
// [ref](http://stackoverflow.com/questions/14087924/cannot-enqueue-handshake-after-invoking-quit)

// Error: Cannot enqueue Handshake after already enqueuing a Handshake.
//     at Protocol._validateEnqueue (/Users/Kael/Codes/Framework/neocortex/node_modules/mysql/lib/protocol/Protocol.js:126:16)
//     at Protocol._enqueue (/Users/Kael/Codes/Framework/neocortex/node_modules/mysql/lib/protocol/Protocol.js:89:13)
//     at Protocol.handshake (/Users/Kael/Codes/Framework/neocortex/node_modules/mysql/lib/protocol/Protocol.js:42:41)
conn.connect = conn.end = function(){};

// use this trick, so that we could restart mysql connection whenever fails
conn.query = function(sql, values, callback) {
    var origin_callback = typeof values === 'function' ? values : callback;

    // if connection failed or has not started, create new connection
    conn.createConnection();

    try {
        conn.connection.query.apply(conn.connection, arguments);
    } catch(e) {
        conn.fail();

        // use try-catch to prevent from program exiting caused by mysql
        origin_callback(e);
    }
};

conn.fail = function() {
    try{
        conn.connection.end();
    }catch(e){};

    // set flag to `false`, we will reconnect the next time
    conn.connected = false;
};


// start connection
conn.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'test',
    // debug: true
});
