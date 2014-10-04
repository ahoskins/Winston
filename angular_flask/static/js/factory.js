// Module
//
var demoIndex = angular.module('demoIndex', ['mm.foundation']);


// Factory
demoIndex.factory('courseFactory', function() {
	var classes = [
		{name:'ECE 304',prof:'Mani'},
		{name:'CMPUT 272',prof:'Lorna'},
		{name:'CMPUT 274',prof:'Nerd'},
		{name:'ECE 311',prof:'Good man'},		
		{name:'ECE 340',prof:'Woman?'}
	];
	
	var factory ={};

	factory.getClasses = function() {
		return classes;
	};

	return factory;
});