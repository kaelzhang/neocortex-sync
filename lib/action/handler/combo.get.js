'use strict';

var db = require('../../util/db');

module.exports = function(options, callback) {
    db.query('SELECT * FROM CM_cortexCombo', function(err, result) {
        if(err){
            return callback(err);
        }

        callback(null, {
            code: 200,
            json: result

                // category modules according to ComboId
                .reduce(function(prev, current) {
                    var id = current.ComboId;

                    if(!prev[id]){
                        prev[id] = [];
                    }

                    prev[id].push({
                        name: current.Name,
                        version: current.Version
                    });

                    return prev;
                }, [])

                // filter empty lines
                .filter(function(subject, i, arr) {
                    return i in arr;
                })
        });
    });
};