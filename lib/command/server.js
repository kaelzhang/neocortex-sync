'use strict';

var node_http = require('http');
var node_url = require('url');
var node_path = require('path');
var node_fs = require('fs');

var typo = require('typo');
var fs = require('fs-sync');

var express = require('express');

var ACTION_ROOT = node_path.join( __dirname, '..', 'action' );

module.exports = function(options, callback) {

    var app = express();

    app.configure(function() {
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use('')
    });

    app.get('/', function(req, res) {
        node_fs.createReadStream( node_path.join( ACTION_ROOT, 'index.html' ) ).pipe(res);
    });

    app.get('/action/:action/', function(req, res) {
        // TODO
    });


    node_http.createServer(app).listen(options.port, function() {
        var url = 'http://localhost:' + options.port;

        typo.log('Neocortex server started at {{url}}', {
            url: url
        });

        options.open && require('child_process').exec('open ' + url);
        callback && callback();
    });

    // var url = node_url.parse(req.url, true);

    // var action = url.pathname.replace(/^\//, '');
    // var action_file = node_path.join( ACTION_ROOT, action + '.js' );

    // // Server index
    // if( url.pathname === '/' ){
        

    //    // If action exists
    // }else if( fs.exists( action_file ) ){
    //     var handler = require(action_file);
    //     var options = url.query;

    //     // the invocation of the action handler is from http request
    //     options.http = true;

    //     handler(options, function(err, data) {

    //         // roules
    //         if(err){
    //             res.writeHead(500, "Server Side Error");
    //             if(!data){
    //                 data = {
    //                     json: {
    //                         error: err
    //                     }
    //                 };
    //             }
    //             res.write( JSON.stringify(data.json) );

    //         }else if(data.json){
    //             res.setHeader("Content-Type", "application/json");
    //             res.writeHead(data.code, "OK");
    //             res.write( JSON.stringify(data.json) );
    //         }

    //         res.end();
    //     });

    // // invalid action
    // }else{
    //     res.writeHead(500, "Server Side Error");
    //     res.write(
    //         JSON.stringify({
    //             error: typo.template('action <{{action}}> not found.', {
    //                 action: action || 'empty'
    //             }) 
    //         })
    //     );
    //     res.end();
    // }

};