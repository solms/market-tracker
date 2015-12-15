'use strict';

(function () {
	angular
		.module('marketTrackerApp', ['ngResource'])
		.controller('stockController',
			['$scope',
			'$resource',
			function ($scope, $resource) {
				var Stocks = $resource('/api/stocks');

				$scope.showStocks = function () {
					Stocks.query(function (results){
						$scope.stocks = results;
						console.log('Results: ' + JSON.stringify(results));
					})
				}

				$scope.addStock = function () {
					Stocks.save({'code':'TEMP2'} ,function () {

					});
				};

				$scope.removeStock = function(){
					Stocks.remove({'code':'TEMP'},function(){

					})
				}
		}]);
})();
