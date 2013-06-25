'use strict';

// santitize req.query to prevent XSS

var santitizer = module.exports = {};
var parser = require('comfort').parser;

// <abc>
// <abc/>
// <abc
var REGEX_STRIP_TAGS = /<[^>]+[>$]/g;

var TYPES = {
    html: {

        // you must define your type as 'html', or all html tags will be stripped
        type: 'html',
        validate: function(data, key, value) {
            data[key] = String(value);
        }
    },

    // @override
    String: {
        type: String,
        validate: function(data, key, value) {
            data[key] = String(value).replace(REGEX_STRIP_TAGS, '');
        }
    }
};

function mix(receiver, supplier, override){
    if(arguments.length === 2){
        override = true;
    }

    var key;
    for( key in supplier ){
        if( override || !(key in receiver) ){
            receiver[key] = supplier[key];
        }
    }
}

Object.keys(parser.TYPES).forEach(function(key) {
    TYPES[key] = mix({}, parser.TYPES[key], false);
});


santitizer.clean = function(data, rules) {
    return parser.clean(data, rules, santitizer.TYPES);
};

santitizer.TYPES = TYPES;


