'use strict';

var node_http = require('http');
var node_url = require('url');
var node_path = require('path');
var node_fs = require('fs');

var typo = require('typo');
var fs = require('fs-sync');

var express = require('express');
var santitizer = require('../action/santitizer');

var HANDLER_ROOT = node_path.join( __dirname, '..', 'action', 'handler' );
var OPTION_ROOT = node_path.join( __dirname, '..', 'action', 'option' )

module.exports = function(options, callback) {
    var app = express();

    app.configure(function() {
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(app.router);

        // 404 handler
        app.use(function(req, res) {
            res.status(404).sendfile( node_path.join( HANDLER_ROOT, '404.html' ) );
        });
    });

    app.get('/', function(req, res) {
        res.sendfile( node_path.join( HANDLER_ROOT, 'index.html' ) );
    });

    // http://localhost:9230/action/dependencies?abc
    app.get('/action/:action', function(req, res) {
        var action = req.param('action').replace(/\/$/, '');
        var handler_module = node_path.join( HANDLER_ROOT, action + '.js' );
        var option_module = node_path.join( OPTION_ROOT, action + '.js' );

        if(fs.exists(handler_module)){
            var options = req.query;
            var handler = require(handler_module);

            if(fs.exists(option_module)){
                var santitize_rule = require(option_module);
                options = santitizer.clean(req.query, santitize_rule);
            }

            handler(options, function(err, data) {
                if(!data){
                    data = {
                        code: 500,
                        json: {
                            error: err
                        }
                    };
                }
                res.jsonp(data.code, data.json);
            });

        }else{
            res.jsonp(500, {
                error: typo.template('action <{{action}}> not found.', {
                    action: action || 'empty'
                })
            });
        }
    });

    node_http.createServer(app).listen(options.port, function() {
        var url = 'http://localhost:' + options.port;

        typo.log('Neocortex server started at {{url}}', {
            url: url
        });

        options.open && require('child_process').exec('open ' + url);
        callback && callback();
    });

};