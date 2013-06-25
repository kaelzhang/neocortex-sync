'use strict';

module.exports = {
    callback: {
        type: String
    },

    packages: {
        type: String,
        value: function(packages) {
            return (packages || '').split(',').map(function(p) {
                return p.trim();
            });
        }
    }
};