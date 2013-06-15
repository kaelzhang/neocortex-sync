'use strict';

var mysql = require('mysql');
var request = require('request');
var async = require('async');

// CREATE TABLE CM_neuronDependencies
// (
// Package varchar(50) not null,
// Version varchar(20) not null,
// Dependencies text,
// primary key (Package,Version)
// );

///////////////////////////////////////////////////////////////
// config
var conn = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'test',
    // debug: true
});



conn.connect();



// {
//     "a@0.0.1": {
//         "b": "0.0.1"
//     },
//     "b@0.0.1": {}
// }
var deps_cache = {};

var splitted = module.split('@');
var name = splitted[0];
var version = splitted[1];


function is_empty_object(obj){
    return !!Object.keys(obj).length;
}

// get module deps
function get_dependencies(name, version, callback){
    async.waterfall([
        function(done) {
            request([registry, name, version].join('/'), function(err, res, json) {
                var parsed = parse_json(json, done);

                done(null, parsed.cortexDependencies || {});
            });
        }

    ], function(err, deps) {
        if(err){
            return callback(err);
        }

        var series = [];

        Object.keys(deps).forEach(function(dep_name) {
            var dep_version = deps[dep_name];
            var dep = dep_name + '@' + dep_version;

            if( !deps_cache[dep] ){
                deps_cache[dep] = true;

                series.push(function(done) {
                    get_dependencies(dep_name, dep_version, done);
                });
            }
        });

        async.series(series, callback);
    });
}

function deps2array(obj) {
    var array = [];

    Object.keys(obj).forEach(function(dep) {
        var dep_dep_obj = obj[dep];

        pushUnique(array, dep);
        pushUnique(
            array, 
            Object.keys(dep_dep_obj).map(function(dep_name) {
                return dep_name + '@' + dep_dep_obj[dep_name];
            })
        );
    });

    return array;
}

get_dependencies(name, version, function(err) {
    var deps = deps2array(deps_cache);

    async.waterfall([
        function(done) {
            conn.query('DELETE FROM CM_neuronDependencies WHERE Package = ? AND Version = ?', [
                name, version

            ], function(err) {
                done(err);
            });
        },

        function(done) {
            conn.query('INSERT INTO CM_neuronDependencies SET ?', {
                Package: name,
                Version: version,
                Dependencies: deps.join(',')

            }, done);
        }

    ], function(err) {
        conn.end();

        if(err){
            process.stdout.write('Database error, ' + err + '\n');
            process.exit(1);
        }

        process.stdout.write('Success!\n');
    });
});






