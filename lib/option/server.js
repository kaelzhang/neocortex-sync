'use strict';

exports.options = {
    open: {
        type: Boolean,
        info: 'if `true`, your browser will automatically open cortex server root when started.',
        value: true
    },

    port: {
        type: Number,
        info: 'server port.',

        // > 9000 will be more safe
        // NEO -> 230
        value: 9230
    }
};

exports.info = 'Start neocortex server.';

exports.usage = [
    '{{name}} server [options]'
];