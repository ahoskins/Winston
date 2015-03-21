
/*
 * GET home page.
 */

 /*
The issue is that I don't really know what the facebook crawler is doing.  It doesn't log this when, so it seemms
like the crawler is not using this route.  But since this is the root route, I'm not really sure it makes sense
what else the crawler could be triggering...maybe I'll get Ross to look into this one.
 */

exports.index = function(req, res){
    res.render('index', { production: req.in_production });
};

exports.partials = function (req, res){
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.error = function(req, res) {
	res.render('partials/error');
}