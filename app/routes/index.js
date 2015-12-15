'use strict';

var path = process.cwd();
//var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var StockHandler = require(path + '/app/controllers/stockHandler.server.js');

module.exports = function (app, db) {

	//var clickHandler = new ClickHandler(db);
	var stockHandler = new StockHandler(db);

	app.route('/')
		.get(function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	/*app.route('/api/clicks')
		.get(clickHandler.getClicks)
		.post(clickHandler.addClick)
		.delete(clickHandler.resetClicks);*/

	app.route('/api/stocks')
		.get(stockHandler.getStocks)
		.post(stockHandler.addStock)
		.delete(stockHandler.removeStock);
};
