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

				// Set up the timeframe variable to default to 1 week
				var timeframe = 7;

				// Set up graphing area
				var outerWidth  = 1100,
						outerHeight = 350;
				var margin = { top: 50, right: 100, bottom: 50, left:	100 };
				var xColumn = 'date';
				var yColumn = 'close';

				var innerWidth = outerWidth - margin.left - margin.right;
				var innerHeight = outerHeight - margin.top - margin.bottom;

				var xScale = d3.time.scale()
					.range([0, innerWidth]);
				var yScale = d3.scale.linear()
					.range([innerHeight, 0]);

				var colorScale = d3.scale.category10();

				var svg = d3.select('#graph-div').append('svg')
					.attr('width', outerWidth)
					.attr('height', outerHeight);

				var g = svg.append("g")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				var xAxisG = g.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + innerHeight + ")");
				var xAxisLabel = xAxisG.append("text")
	        .style("text-anchor", "middle")
	        .attr("transform", "translate(" + (innerWidth / 2) + "," + 40 + ")")
	        .attr("class", "label")
	        .text('Date');
		    var yAxisG = g.append("g")
		      .attr("class", "y axis");
				var yAxisLabel = yAxisG.append("text")
	        .style("text-anchor", "middle")
	        .attr("transform", "translate(-" + 50 + "," + (innerHeight / 2) + ") rotate(-90)")
	        .attr("class", "label")
	        .text('Price per share ($)');

				var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
	        .outerTickSize(0);          // Turn off the marks at the end of the axis.
	      var yAxis = d3.svg.axis().scale(yScale).orient("left")
	        .outerTickSize(0);          // Turn off the marks at the end of the axis.

				var line = d3.svg.line()
	        .x(function(d) { return xScale(d[xColumn]); })
	        .y(function(d) { return yScale(d[yColumn]); });

				// Add the stocks in the database to the $scope.stocks variable - this
				// allows the selected stocks to be displayed.
				// Also update the graph.
				var showStocks = function () {
					$http.get('/api/stocks')
						.success(function(response){
							$scope.stocks = [];
							for(var i=0; i<response.length; i++){
								$scope.stocks.push(response[i]);
							}
							// If $scope.stocks is empty, delete all graphs
							if($scope.stocks.length == 0){
								render([]);
							}
							// Update the local array for graphing the stocks
							for(var i=0; i<$scope.stocks.length; i++){
								// Get the info for each stock from YQL finance, and then update
								// the local array of stock objects for graphing
								stocks_arr = [];
								getStockInfo($scope.stocks[i].code)
									.success(function(data){
										// Redundant, but check that the data exists anyway
										console.log(data);
										var results = data.query.results.quote;
										if(results != null){
											console.log('Successfully got data via YQL.');
											addStockToGraphArray(results);
											render(stocks_arr);
										}
										else{
											console.log('Could not retrieve stock data from YQL.');
										}
									});
							}
					});
				}
				showStocks();

				$scope.addStock = function (to_add) {
					// Retrieve the stock data with Yahoo Query Language
					// and add it to the database if successful
					getStockInfo(to_add).success(function(data){
						// Check if info on the specified stock code is found
						var results = data.query.results.quote;
						if(results != null){
							$scope.stock_to_add = '';
							console.log('Successfully got data via YQL.');
							$http.post('/api/stocks?code=' + to_add)
								.success(function(response){
									showStocks();
									console.log(response);
								});
							} else {
								console.log('Could not retrieve stock data from YQL.');
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

				// Retrieve the stock data from YQL finance
				var getStockInfo = function(symbol){
					var date 						= new Date();
					var yql_end_date 		= date.getFullYear()+'-'+(Number(date.getMonth())+1)+'-'+date.getDate();
					console.log('End date: ' + yql_end_date);
					date.setDate(date.getDate()-timeframe);
					var yql_start_date 	= date.getFullYear()+'-'+(Number(date.getMonth())+1)+'-'+date.getDate();
					console.log('Start date: ' + yql_start_date);

					return $http.get('http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "'+yql_start_date+'" and endDate = "'+yql_end_date+'"&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys');
				}

				// Render the line graph
				var render = function(data){
					//	Clear the SVG canvas
					g.selectAll("path").remove();

					// Determine the domain
					var max = 0,
							min = 0;
					for(var i=0; i<data.length; i++){
						var curr_max = d3.max(data[i].values,
																	function (d) { return d[yColumn] });
						if(curr_max>max){
							if(max == 0){
								min = curr_max;
							}
							max = curr_max;
						}
						var curr_min = d3.min(data[i].values,
																	function (d) { return d[yColumn] });
						if(curr_min<min){
							min = curr_min;
						}
					}

					// Set the domain
					if(data[0] != undefined){
						xScale.domain([stocks_arr[0].values[stocks_arr[0].values.length-1].date,
														stocks_arr[0].values[0].date]);
						yScale.domain([min, max]);
					}

					// Call the axes
					xAxisG.call(xAxis);
					yAxisG.call(yAxis);

					for(var i=0; i<data.length; i++){
						var path = g.append("path");
						path.attr("d", line(data[i].values));
					}
	      };


				/* 	Populate a local array with stock information to be used for graphing
				 		Format:
						stocks_arr = [Object, Object, Object]
							where Object = {
								name: 'stock_symbol'
								values: [{date: 'date', close: closing_price}, ...]
							}
				*/
				var addStockToGraphArray = function(results){
					var stock_values = [];
					for (var i=0; i<results.length; i++){
						stock_values.push({
							date: new Date(results[i].Date),
							close: Number(results[i].Close)
						})
					}
					stocks_arr.push({
						name: results[0].Symbol,
						values: stock_values
					});
				}

				// Change the time frame of the graph, and update it
				$scope.changeTimeframe = function(tf){
					timeframe = tf;
					showStocks();
				}
		}]);
})();
