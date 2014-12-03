/**
 * Created by Andrew on 14-11-18.
 */

// Attached to all three layers of accordion
coreModule.directive('scrollSmooth', ['$document', '$window', function($document, $window) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.bind('click', function (e) {

                /*
                **************************
                Don't bubble up this event
                **************************
                 */
                e.stopPropagation();

                /*
                ***********************
                Setup scroll parameters
                ***********************
                 */

                // Get current position of element relative to top of the screen
                var offsetTop = element[0].getBoundingClientRect().top;

                var duration = 500;

                var easeInOutQuad = function (t) {
                    return t<0.5 ? 2*t*t : -1+(4-2*t)*t ;
                };

               var easeInExpo = function (t) {
                    return (t===0) ? 2 : 2 * Math.pow(2, 10 * (t/3 - 1)) + 1;
                };

                /*
                *******************************************
                Only scroll if element is not within screen
                Using imported scrollSmooth function
                *******************************************
                 */

                if (offsetTop < 0) {
                    $document.scrollToElement(element, 0, duration, easeInExpo());
                }

            });
        }
    };
}]);