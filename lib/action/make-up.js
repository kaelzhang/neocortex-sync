'use strict';

var get_deps = require('./dependencies');
var conn = require('../util/mysql-wrapper');
var async = require('async');
// var semver = require('semver');
var lang = require('../util/lang'); 

// make up the data loss

// @param {Object} options
// - module: {string} 'a@0.0.1'
// - dependencies: {Array}
// - pending: {Array}
module.exports = function(options, callback) {
    var series = [];

    // if(!options.module){
    //     return callback(null, {
    //         code: 403,
    //         json: {
    //             error: 'no module specified'
    //         }
    //     });

    // }else if(){
    //     return 
    // }

    // if from direct http request, 
    // `options.dependencies` and `options.pending` could be trusted
    if(options.http){
        series.push(function(done) {
            get_deps({
                module: options.module

            }, function(err, data) {
                if(err){
                    return done(err);
                }

                // module not ok
                if(data.code !== 200){
                    return done(true, data);
                }
                
                options.dependencies = data.json.found.array;
                options.pending = data.json.not_found;

                done();
            })
        });
    }

    series.push(function(done) {
        conn.query(
            "SELECT * FROM CM_cortexDependencies WHERE Pending LIKE '%" + options.module + "%'", 
            function(err, result) {
                if(err){
                    return done(err);
                }

                done(null, result);
            }
        );
    });

    series.push(function(result, done) {
        async.series(
            result.map(function(record) {
                return function(sub_done) {
                    conn.query(
                        "UPDATE CM_cortexDependencies SET ? WHERE Package = '" + 
                        record.Package + 
                        "' AND Version = '" + 
                        record.Version + 
                        "'", 

                        {
                            Dependencies: lang.pushUnique( record.Dependencies.split(','), options.dependencies ),
                            Pending: lang.pushUnique(
                                record.Pending.split(',').filter(function(p) {
                                    return p !== options.module;
                                }), 
                                options.pending
                            )

                        }, function(err) {
                            sub_done(err);
                        }
                    );
                };
            }),

            function(err) {
                done(err, result.length);
            }
        );
    });

    async.waterfall(series, function(err, data) {
        if(err){
            return callback(err, data);
        }

        callback(null, {
            code: 200,
            json: {
                msg: data + ' rows affected'
            }
        });
    });
};