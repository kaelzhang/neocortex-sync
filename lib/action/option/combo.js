'use strict';

module.exports = {
    callback: {
        type: String
    },

    modules: {
        type: String,
        value: function(modules) {
            return (modules || '').split(',')
                .filter(function(module) {
                    return !!module;
                })

                // change version
                .map(function(module) {
                    var splitted = module.trim().split('@');
                    var name = splitted[0];

                    // in Vision one, deal nothing with version
                    // var version = splitted[1];
                    var version = '0.0.0';

                    return name + '@' + version;
                })

                // make unique
                .reduce(function(prev, current) {
                    if( ! ~ prev.indexOf() ){
                        prev.push(current);
                    }

                    return prev;
                }, []);
        }
    }
};