'use strict';

module.exports = get_dependencies;

var request = require('request');
var async = require('async');
var profile = require('cortex-profile');

// @public
// @param {Object} options
// - module {string}
// - registry {string} 
// @param {function(err, result)} callback

// this is an action exports
// http://localhost:<port>/dependencies?module=a@0.0.1&registry=http://blah
// -> request: {module: 'a@0.0.1', registry: 'http://blah'}

// and the response will be the corresponding json of `result` argument of `callback`
// callback(err, result)
// if !err
// -> response.statusCode: 200
// -> response.body: JSON.stringify(result)
// TODO: if err,
// -> response.statusCode: err.code
// -> response.body: err.msg
function get_dependencies(options, callback){
    var module = options.module;

    // debug
    options.registry = options.registry || profile.option('registry');

    var splitted = module.split('@');
    var name = splitted[0];
    var version = splitted[1];

    // {
    //     "a@0.0.1": {
    //         "b": "0.0.1"
    //     },
    //     "b@0.0.1": {}
    // }
    var cache = {};

    recursively_get_dependencies(name, version, cache, options, function(err) {
        if(err){
            return callback(err);
        }

        callback(null, {
            tree: cache,
            array: deps2array(cache)
        });
    });
}


// get module deps
function recursively_get_dependencies(name, version, cache, options, callback){
    var registry = options.registry;

    async.waterfall([
        function(done) {
            // get dependencies information
            // http://registry.npmjs.org/async/0.0.1
            request([registry, name, version].join('/'), function(err, res, json) {
                var parsed = parse_json(json, done);

                done(null, parsed.cortexExactDependencies || {});
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
            if( !cache[dep] ){
                cache[dep] = true;

                series.push(function(done) {
                    recursively_get_dependencies(dep_name, dep_version, cache, options, done);
                });
            }

        });

        cache[name + '@' + version] = deps;

        async.series(series, callback);
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

// @private
// push the giving `array` to the end of `append`, and make sure every element is unique
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
}

