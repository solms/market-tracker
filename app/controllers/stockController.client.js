'use strict';

(function () {
	angular
		.module('marketTrackerApp', [])
		.controller('stockController',
			['$scope',
			'$http',
			function ($scope, $http) {
				$scope.stocks = [];
				// Initialise stock object array
				var stocks_arr = [];

				// Set up graphing area
				var outerWidth  = 500,
						outerHeight = 300;
				var margin = { top: 50, right: 50, bottom: 50, left:	50 };
				var xColumn = 'date';
				var yColumn = 'close';

				var svg = d3.select("#graph-div").append("svg")
					.attr("width",  outerWidth)
					.attr("height", outerHeight);
				var g = svg.append("g")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var innerWidth  = outerWidth  - margin.left - margin.right;
	      var innerHeight = outerHeight - margin.top  - margin.bottom;

				var xAxisG = g.append("g")
        	.attr("transform", "translate(0," + innerHeight + ")");
				var yAxisG = g.append("g");

				var xScale = d3.scale.linear().range([0, innerWidth]);
				var yScale = d3.scale.linear().range([innerHeight, 0]);

				var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
				var yAxis = d3.svg.axis().scale(yScale).orient("left");

				var line = d3.svg.line()
					.x(function(d) { return xScale(d[xColumn]); })
					.y(function(d) { return yScale(d[yColumn]); });

				var showStocks = function () {
					$http.get('/api/stocks')
						.success(function(response){
							$scope.stocks = [];
							for(var i=0; i<response.length; i++){
								$scope.stocks.push(response[i]);
							}
					});
				}
				showStocks();

				$scope.addStock = function (to_add) {
					// Retrieve the stock data with Yahoo Query Language
					// and add it to the database if successful
					getStock(to_add).success(function(data){
						// Check if info on the specified stock code is found
						if(data.query.results != null){
							console.log('Successfully got data via YQL.');
							// Create an array of stock objects to use for graphing
							var results = data.query.results.quote;
							for (var i=0; i<results.length; i++){
								stocks_arr.push({
									code: to_add,
									date: i,
									close: Number(results[i].Close)
								})
							}
							// Render the graph
							var path = g.append('path');
							render(path, stocks_arr);
							// Add the stock code to the database
							$http.post('/api/stocks?code=' + to_add)
								.success(function(response){
									showStocks();
									console.log(response);
								});
							} else {
								console.log('Could not find stock on YQL.');
							}
					});
				};

				$scope.removeStock = function(to_delete){
					$http.delete('/api/stocks?code=' + to_delete)
						.success(function(response){
							showStocks();
							console.log(response);
						});
				}

				var getStock = function(symbol){
					var date 						= new Date();
					var yql_end_date 		= date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
					console.log('End date: ' + yql_end_date);
					date.setDate(date.getDate()-30);
					var yql_start_date 	= date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
					console.log('Start date: ' + yql_start_date);

					return $http.get('http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "'+yql_start_date+'" and endDate = "'+yql_end_date+'"&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys');
				}

				// Render the line graph
				var render = function(path, data){
	        xScale.domain(d3.extent(data, function (d){ return d[xColumn]; }));
	        yScale.domain(d3.extent(data, function (d){ return d[yColumn]; }));
					path.attr('d', line(data));
					xAxisG.call(xAxis);
					yAxisG.call(yAxis);
	      };
		}]);
})();
