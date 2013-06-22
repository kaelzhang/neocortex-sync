'use strict';

var get_deps = require('./dependencies');
var db = require('../util/db');
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

    var splitted = options.module.split('@');
    var name = splitted[0];
    var version = splitted[1];

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
            });
        });
    }

    series.push(function(done) {
        db.query(
            'SELECT CM_cortexPendingDependencies.PackageAffected, CM_cortexDependencies.Dependencies FROM CM_cortexPendingDependencies INNER JOIN CM_cortexDependencies {{on on}} {{where where}}', {
            on: {
                'CM_cortexPendingDependencies.PackageAffected': 'CM_cortexDependencies.Package'
            },

            where: {
                'CM_cortexPendingDependencies.Package': name,
                'CM_cortexPendingDependencies.Version': version
            }
        },
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
                    // the record which matches each result will be only one
                    db.query(
                        'UPDATE CM_cortexDependencies {{set set}} {{where where}}', {
                            where: {
                                Package: record.Package,
                                Version: record.Version
                            },

                            set: {
                                Dependencies: lang.pushUnique( record.Dependencies.split(','), options.dependencies ),
                                Pending: lang.pushUnique(
                                    record.Pending.split(',').filter(function(p) {
                                        return p !== options.module;
                                    }), 
                                    options.pending
                                )
                            }
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
            data ? callback(null, data) : callback(err);

        }else{
            callback(null, {
                code: 200,
                json: {
                    msg: data + ' rows affected'
                }
            });
        }

        
    });
};