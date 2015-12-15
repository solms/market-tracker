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
						var results = data.query.results.quote;
						console.log(results);
						for (var i=0; i<results.length; i++){
							stock_obj.date.push(results[i].Date);
							stock_obj.close.push(results[i].Close);
						}
						console.log(stock_obj);
					});
					$http.post('/api/stocks?code=' + to_add)
						.success(function(response){
							showStocks();
							console.log(response);
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
					return $http.get('http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.historicaldata where symbol = "' + symbol + '" and startDate = "2015-12-10" and endDate = "2015-12-14"&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys');
				}
		}]);
})();
