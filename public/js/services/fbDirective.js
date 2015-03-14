winstonApp.directive('facebook', ['$http', function($http) {
		return {
			scope: {
				shares: '='
			},
			transclude: true,
			template: '<div class="facebookButton">' +
				'<div class="pluginButton">' +
				'<div class="pluginButtonContainer">' +
				'<div class="pluginButtonImage">' +
				'<button type="button">' +
				'<i class="pluginButtonIcon img sp_plugin-button-2x sx_plugin-button-2x_favblue"></i>' +
				'</button>' +
				'</div>' +
				'<span class="pluginButtonLabel">Share</span>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'<div class="facebookCount">' +
				'<div class="pluginCountButton pluginCountNum">' +
				'<span ng-transclude></span>' +
				'</div>' +
				'<div class="pluginCountButtonNub"><s></s><i></i></div>' +
				'</div>',
			link: function(scope, element, attr) {
				attr.$observe('url', function() {
					if (attr.shares && attr.url) {
						$http.get('https://api.facebook.com/method/links.getStats?urls=' + attr.url + '&format=json').success(function(res) {
							var count = res[0] ? res[0].total_count.toString() : 0;
							var decimal = '';
							if (count.length > 6) {
								if (count.slice(-6, -5) != "0") {
									decimal = '.' + count.slice(-6, -5);
								}
								count = count.slice(0, -6);
								count = count + decimal + 'M';
							} else if (count.length > 3) {
								if (count.slice(-3, -2) != "0") {
									decimal = '.' + count.slice(-3, -2);
								}
								count = count.slice(0, -3);
								count = count + decimal + 'k';
							}
							scope.shares = count;
						}).error(function() {
							scope.shares = 0;
						});
					}
					element.unbind();
					element.bind('click', function(e) {
						FB.ui({
							method: 'share',
							href: attr.url
						});
						e.preventDefault();
					});
				});
			}
		};
	}]);

