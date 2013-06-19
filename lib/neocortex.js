'use strict';

var neocortex = module.exports = {
    actions: {},
    commander: require('./commander')
};

var actions = {
    'get_deps': 'dependencies'
    'save_deps': 'save_dependencies'
};

Object.keys(actions).forEach(function(action) {
    neocortex.actions[action] = require('./action/' + actions[action]);
});







