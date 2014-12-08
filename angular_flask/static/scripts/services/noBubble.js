/**
 * Created by Andrew on 14-11-25.
 */

// General directive to prevent event propagation (not currently used)
winstonApp.directive('noBubble', function() {
    return {
        link: function (scope, element) {
            element.bind('click', function (e) {
                e.stopPropagation();
            });
        }
    } ;
});
