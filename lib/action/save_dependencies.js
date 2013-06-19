'use strict';

var get_deps = require('./dependencies');
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


module.exports = function(options, callback) {
	try {
		conn.connect();
	} catch(e) {
		return callback('Database connect error.');
	}

    get_deps(options, function(err, deps) {
    	if(err){
    		return callback(err);
    	}

    	var module = options.module;
    	var splitted = module.split('@');
    	var name = splitted[0];
    	var version = splitted[1];

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
		            Dependencies: deps.array.join(',')

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
		    		msg: 'OK'
		    	});
		    }

		    conn.end();
		});
    });
};