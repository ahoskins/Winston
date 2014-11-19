/**
 * Created by Andrew on 14-11-18.
 */

coreModule.directive('scrollSmooth', ['$document', '$window', function($document, $window) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            // @param {event-obj}
            //
            element.bind('click', function (e) {
                // TODO: height gets confusing when scrolling for some reason...maybe they to sort this out later
                //
                //var windowHeight = $window.innerHeight;
                //vart elementHeight = element[0].offsetHeight;
                //var offsetTop = element[0].getBoundingClientRect().top;
                //console.log(windowHeight);
                //console.log(elementHeight);
                //console.log(offsetTop);
                //console.log("...");
                //var bottomLocation = windowHeight - (offsetTop + elementHeight);

                // Scroll to element
                //
                e.stopPropagation();
                var duration = 500;

                var easeInOutQuad = function (t) {
                    return t<0.5 ? 2*t*t : -1+(4-2*t)*t ;
                };

                $document.scrollToElement(element, 0, duration, easeInOutQuad());

            });
        }
    };
}]);