'use strict';

(function () {
	angular
		.module('marketTrackerApp', [])
		.controller('stockController',
			['$scope',
			'$http',
			function ($scope, $http) {
				$scope.stocks = [];

				$scope.showStocks = function () {
					$http.get('/api/stocks')
						.success(function(response){
							$scope.stocks = [];
							for(var i=0; i<response.length; i++){
								$scope.stocks.push(response[i]);
							}
					});
				}
				$scope.showStocks();

				$scope.addStock = function (to_add) {
					$http.post('/api/stocks?code=' + to_add)
						.success(function(response){
							$scope.showStocks();
							console.log(response);
						});
				};

				$scope.removeStock = function(to_delete){
					$http.delete('/api/stocks?code=' + to_delete)
						.success(function(response){
							$scope.showStocks();
							console.log(response);
						});
				}

				$scope.searchBarchart = function(code){
					$http.get('http://marketdata.websol.barchart.com/getQuote.json?key=c2d51bf69f6aacceb3fb55d333a0e7c8&symbols=ZC*1,IBM,GOOGL,^EURUSD')
						.success(function(response){
							console.log(response);
						});
				}
		}]);
})();
