# Action modules
This is a developer draft.

## Logic

action: `'dependencies'`

path: `'dependencies.js'`

If comes a request:

`http://localhost:\<port\>/dependencies?module=a@0.0.1&registry=http://blah`

->

options: `{module: 'a@0.0.1', registry: 'http://blah'}`

Then

`options` will be the first argument of the exports of 'dependencies' action.


## API

### module.exports

`function(options, callback)`

#### options

will be the options above.

#### callback

`function(err, data)`

##### err
`string`

This will be a server error, statusCode -> 500

##### data
`object`

- code: `number` : res.statusCode
- json: `object` : if exists, header -> `'application/json'`, body -> `Object.stringify(data.json)`