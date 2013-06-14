'use strict';

var mysql = require('mysql');
var request = require('request');
var async = require('async');

// CREATE TABLE DP_neuronDependencies
// (
// Package varchar(50),
// Version varchar(20),
// Dependencies text
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

var registry = 'http://registry.npm.lc';

var module = 'cortex@2.0.2';

conn.connect();

function parse_json(json, callback) {
    var parsed;

    try{
    	parsed = JSON.parse(json);
    }catch(e){
    	callback('Error parse json, ' + e);
    }

    return parsed;
}

// @private
// push the giving array to the end of `append`, and make sure every element is unique
function pushUnique(append, array){
    array = Array.isArray(array) ? array : [array];

    var push = Array.prototype.push,
        length = array.length,
        j, k,
        append_length,
        unique,
        member;
                
    for(k = 0; k < length; k ++){
        // append.length is ever changing
        append_length = append.length;
        member = array[k];
        unique = true;
        
        for(j = 0; j < append_length; j ++){
            if(member === append[j]){
                unique = false;
                break;
            }
        }
        
        // make sure, all found members are unique
        if(unique){
        
            // use `push.call(append, member)` instead of `append.push(member)`
            // append might be array-like objects
            push.call(append, member);
        }
    }
    
    return append;
};

// {
// 	"a@0.0.1": {
// 		"b": "0.0.1"
// 	},
// 	"b@0.0.1": {}
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
		    conn.query('DELETE FROM DP_neuronDependencies WHERE Package = ? AND Version = ?', [
		    	name, version

		    ], function(err) {
		        done(err);
		    });
		},

		function(done) {
		    conn.query('INSERT INTO DP_neuronDependencies SET ?', {
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






