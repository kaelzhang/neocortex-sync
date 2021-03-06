'use strict';

// save combo information

var db = require('../../util/db');
var async = require('async');

// @param {Object} options
// - modules {string}
function save_combo (modules, callback) {
    async.waterfall([
        function(done) {
            db.query('SELECT ComboId FROM CM_cortexCombo ORDER BY ComboId DESC LIMIT 1', function(err, result) {
                done(err, result);
            });
        },

        // TODO:
        // care for concurrence
        function(result, done) {
            var combo_id = result.length ? result[0].ComboId + 1 : 0;

            async.parallel(
                modules.map(function(module) {
                    return function(sub_done) {
                        var splitted = module.split('@');
                        var name = splitted[0];
                        var version = splitted[1];

                        var record = {
                            Name: name,
                            Version: version,
                            ComboId: combo_id
                        };

                        db.query('INSERT INTO CM_cortexCombo {{values record}} ON DUPLICATE KEY {{update update}}', {
                            record: record,
                            update: {
                                ComboId: combo_id
                            }

                        }, function(err) {
                            sub_done(err);
                        });
                    }

                }), function(err) {
                    done(err);
                }

            ); // end async
        }

    ], function(err) {
        callback(err);
    });
};


module.exports = function(options, callback) {
    var modules = options.modules;

    if(modules.length === 0){
        return callback(null, {
            code: 201,
            json: {
                msg: 'nothing changed. you should tell us which modules to combo'
            }
        });
    }

    async.series(
        modules.map(function(group) {
            return function(done){
                save_combo(group, done);
            };

        }), function(err) {
            callback(null, {
                code: 200,
                json: {
                    msg: modules.reduce(function(prev, group) {
                        return prev + group.length;

                    }, 0) + ' rows affected.'
                }
            });
        }
    );
};
