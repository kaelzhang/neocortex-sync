'use strict';

var request = require('request');
var async = require('async');
var profile = require('cortex-profile');
var lang = require('../../util/lang');

// get module deps
function recursively_get_dependencies(name, version, cache, options, callback){
    var registry = options.registry;

    async.waterfall([
        function(done) {
            // get dependencies information
            // http://registry.npmjs.org/async/0.0.1
            request([registry, name, version].join('/'), function(err, res, json) {
                if(err){
                    return done(err);
                }

                if( res.statusCode === 404 ){
                    // if package not found, push to `cache.not_found`
                    lang.pushUnique(cache.not_found, name + '@' + version);
                    done(null, {});

                }else{
                    var parsed = parse_json(json, done);
                    done(null, parsed.cortexExactDependencies || {});
                }
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

            // prevent duplicate asynchronous request
            if( !cache.found[dep] ){
                cache.found[dep] = true;

                series.push(function(done) {
                    recursively_get_dependencies(dep_name, dep_version, cache, options, done);
                });
            }

        });

        cache.found[name + '@' + version] = deps;

        async.parallel(series, callback);
    });
}


function parse_json(json, err){
    var parsed;

    if(Object(json) === json){
        return json;
    }

    try{
        parsed = JSON.parse(json);
    }catch(e){
        err('invalid response body, ' + e);
    }

    return parsed || {};
}

// {
//     "a@0.0.1": {
//         "b": "0.0.1"
//     },
//     "b@0.0.1": {}
// }
// -> ['a@0.0.1', 'b@0.0.1']
function deps2array(obj) {
    var array = [];

    Object.keys(obj).forEach(function(dep) {
        var dep_dep_obj = obj[dep];

        lang.pushUnique(array, dep);
        lang.pushUnique(
            array, 
            Object.keys(dep_dep_obj).map(function(dep_name) {
                return dep_name + '@' + dep_dep_obj[dep_name];
            })
        );
    });

    return array;
}


// @public
// @param {Object} options
// - module {string}
// - registry {string} 
// @param {function(err, result)} callback

// See ./README.md
module.exports = function (options, callback){
    var module = options.module;

    // debug
    // options.registry = options.registry || profile.option('registry');
    options.registry = profile.option('registry');

    var splitted = module.split('@');
    var name = splitted[0];
    var version = splitted[1];

    var cache = {
        // {
        //     "a@0.0.1": {
        //         "b": "0.0.1"
        //     },
        //     "b@0.0.1": {}
        // }
        found: {},

        // @type {Array.<string>}
        not_found: []
    };

    recursively_get_dependencies(name, version, cache, options, function(err) {
        if(err){
            return callback(err);
        }

        // `cache.found[dep] = true;`
        cache.not_found.forEach(function(m) {
            delete cache.found[m];
        });

        if( module in cache.found ){
            delete cache.found[module];

            callback(null, {
                code: 200,
                json: {
                    module: module,
                    found: {
                        tree: cache.found,
                        array: deps2array(cache.found)
                    },

                    not_found: cache.not_found
                }
            });
        
        // if the entrance package is not found, there will be a complete failure
        }else{
            callback(null, {
                code: 404,
                json: {
                    error: 'version not found: ' + version
                }
            });
        }
    });
}



