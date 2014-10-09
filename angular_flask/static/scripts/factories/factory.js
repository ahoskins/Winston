// Module
//
var demoIndex = angular.module('demoIndex', ['mm.foundation']);


// Factory
demoIndex.factory('courseFactory', function ($window, $http, $q) {
	// var classes = [
	// 	{name: 'ECE 304',prof: 'Mani'},
	// 	{name: 'CMPUT 272',prof: 'Lorna'},
	// 	{name: 'CMPUT 274',prof: 'Nerd'},
	// 	{name: 'ECE 311',prof: 'Good man'},		
	// 	{name: 'ECE 340',prof: 'Woman?'}
	// ];
	
	var factory ={};

	factory.getClasses = function () {
		// Return a $http request and the promise associated with it
		return( $http({method: 'GET', url: '/api/terms/1490/courses'}) );

	};

	return factory;
});