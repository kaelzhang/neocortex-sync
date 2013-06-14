var mysql = require('mysql');

module.exports = db;

// @param {Object} options
// - host
// - port
// - user
// - password
// - database
function db(options){
	// this.options = options;
	this.connection = mysql.createConnection(options);
};


db.connect = function(options) {
    return new db(options).connect();
};


dp.prototype = {
	connect: function() {
	    this.connection.connect();
	},

	// connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
	query: function(command, document, ) {
	    
	}
};