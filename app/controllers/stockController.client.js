'use strict';

(function () {
	angular
		.module('marketTrackerApp', [])
		.controller('stockController',
			['$scope',
			'$http',
			function ($scope, $http) {
				$scope.stocks = [];

				// Set up graphing area
				var svg = d3.select("#graph-div").append("svg")
					.attr("width",  500)
					.attr("height", 300);
				var xScale = d3.scale.linear().range([0, 500]);
				var yScale = d3.scale.linear().range([0, 300]);

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
					var stocks_arr = [];
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
							render(stocks_arr);
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

				var render = function(data){
	        xScale.domain(d3.extent(data, function (d){ return d.date; }));
	        yScale.domain(d3.extent(data, function (d){ return d.close; }));

	        var circles = svg.selectAll("circle").data(data);
	        circles.enter().append("circle").attr("r", 5);
	        circles
	          .attr("cx", function (d){ return xScale(d.date); })
	          .attr("cy", function (d){ return yScale(d.close); });

	        circles.exit().remove();
	      };
		}]);
})();
