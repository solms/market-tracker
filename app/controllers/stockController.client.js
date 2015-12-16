'use strict';

(function () {
	angular
		.module('marketTrackerApp', [])
		.controller('stockController',
			['$scope',
			'$http',
			function ($scope, $http) {
				$scope.stocks = [];

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
					var stock_obj = {
						date: [],
						close: []
					};
					getStock(to_add).success(function(data){
						if(data.query.results != null){
							console.log('Successfully got data via YQL.');
							var results = data.query.results.quote;
							for (var i=0; i<results.length; i++){
								stock_obj.date.push(results[i].Date);
								stock_obj.close.push(results[i].Close);
							}
							console.log(stock_obj);
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
		}]);
})();
