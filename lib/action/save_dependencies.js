'use strict';

var get_deps = require('./dependencies');
var make_up = require('./make-up.js');
var mysql = require('mysql');
var async = require('async');
// var typo = require('typo');

var conn = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'test',
    // debug: true
});


// save dependencies to mysql
// @param {Object} options
// - module: {string}
module.exports = function(options, callback) {
    try {
        conn.connect();
    } catch(e) {
        return callback('Database connect error.');
    }

    // @param {Object} data
    // - code: {Number}
    // - json: {Object}
    //      - module: {string}
    //      - found: {Object}
    //          - tree: {Object} dependency tree
    //          - array: {Array.<string>} array of dependencies
    //      - not_found: {Array.<string>} array of dependencies which not found
    get_deps(options, function(err, data) {
        if(err){
            return callback(err);
        }

        if(data.code !== 200){
            return callback(err, data);
        }

        var module = options.module;
        var splitted = module.split('@');
        var name = splitted[0];
        var version = splitted[1];

        var dependencies = data.json.found.array.join(',');
        var pending = data.json.not_found.join(',');

        async.waterfall([
            function(done) {
                // remove existing record
                conn.query('DELETE FROM CM_cortexDependencies WHERE Package = ? AND Version = ?', [
                    name, version

                ], function(err) {
                    done(err);
                });
            },

            function(done) {
                conn.query('INSERT INTO CM_cortexDependencies SET ?', {
                    Package: name,
                    Version: version,
                    Dependencies: dependencies,
                    Pending: pending

                }, function(err) {
                    done(err);
                });
            }

        ], function(err) {
            // conn.end();
            if(err){
                callback(err);

            }else{
                callback(null, {
                    code: 200,
                    json: {
                        msg: 'OK'
                    }
                });

                // background task
                make_up({
                    module: options.module,
                    dependencies: dependencies,
                    pending: pending

                }, function(){
                    // there's no message 
                });
            }

            conn.end();
        });
    });
};