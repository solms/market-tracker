'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser')

var app = express();

mongo.connect('mongodb://localhost:27017/clementinejs', function (err, db) {

	if (err) {
		throw new Error('Database failed to connect!');
	} else {
		console.log('MongoDB successfully connected on port 27017.');
	}

	app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
	app.use('/public', express.static(process.cwd() + '/public'));
	app.use( bodyParser.json() );       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));

	routes(app, db);

	var port = process.env.PORT || 3000;
	app.listen(port, function () {
		console.log('Node.js listening on port ' + port + '...');
	});

});
