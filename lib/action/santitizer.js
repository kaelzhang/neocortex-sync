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


Object.keys(parser.TYPES).forEach(function(key) {
    if(!TYPES[key]){
        var type = parser.TYPES[key];

        TYPES[key] = {
            type    : type.type,
            validate: type.validate
        }
    }
});


// TODO: 
santitizer.clean = function(data, rules) {
    return parser.clean(data, rules, santitizer.TYPES);
};

santitizer.TYPES = TYPES;


