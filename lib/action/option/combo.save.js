'use strict';


function split_modules(modules_string){
    return modules_string.split(',')

        .filter(function(module) {
            return !!module.trim();
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
            if( ! ~ prev.indexOf(current) ){
                prev.push(current);
            }

            return prev;
        }, []);
};


module.exports = {
    callback: {
        type: String
    },

    // 'a,b,c'  -> [ ['a', 'b', 'c'] ]
    // 'a~b,c'  -> [ ['a'], ['b', 'c'] ]
    // ''       -> []
    modules: {
        type: String,
        value: function(modules) {
            return !modules ? 
                [] :

                modules.split('~').map(split_modules).filter(function(arr) {
                    return arr.length;
                });
        }
    }
};