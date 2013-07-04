'use strict';

var neocortex = module.exports = {
    actions: {},
    commander: require('./commander')
};

var actions = {
    'get_deps': 'dependencies',
    'save_deps': 'save-dependencies',
    'make_up': 'make-up'
};

Object.keys(actions).forEach(function(action) {
    neocortex.actions[action] = require('./action/' + actions[action]);
});


// http://j1.s1.dpfile.com/combos/~mod~a~0.0.1.min.js,~mod~b~0.0.1.min.js