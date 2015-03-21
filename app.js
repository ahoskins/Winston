
/**
 * Module dependencies
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  morgan = require('morgan'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path');

// module.exports is what other files get if they require() this...so all of 'app' is exposed
var app = module.exports = express();


/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorHandler());
}

var prod = false;
// production only
if (env === 'production') {
  // TODO
  prod = true;
}


/**
* Routes
**/


/**
* Bare domain, render index.jada
* Render the partials received from $routeProvider
* Any other domain render 404.html
 */
app.get('/', routes.index(req, res, prod));
app.get('/partials/:name', routes.partials);
app.use(routes.error);



/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function (req, resp) {
  console.log('Express server listening on port ' + app.get('port'));
});
