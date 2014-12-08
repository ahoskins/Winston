/**
 * Created by Andrew on 14-11-18.
 */

// Not currently used (this worked in foundation, however doesn't seem to work properly in bootstrap)
// I believe bootstrap's accordion has its own "smooth-scroll" type system in place...
//
// add "duScroll" as a dependency if I ever use this again
winstonApp.directive('scrollSmooth', ['$document', '$window', function($document, $window) {
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