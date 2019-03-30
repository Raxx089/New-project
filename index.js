process.on('uncaughtException', function (err) {
  console.log(err);
})

var allRequire = require('./helpers/allRequire');
var config = allRequire.config;
var express = allRequire.express;
var bodyParser = allRequire.bodyParser;
var cookieSession = allRequire.cookieSession;
const path = require('path');
const controllers = require('./controllers');
const adminPath = path.join(__dirname,'admin');

var jsonParser = bodyParser.json({
    limit: '10mb',
    strict: false
});

var app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(jsonParser);
app.use(cookieSession({
	name: config.COOKIE_NAME,
  	keys:[config.SECRET],
  	secret:config.SECRET,
  	secure:false,
  	httpOnly:false,
	maxAge: 30*24 * 60 * 60 * 1000
}));

app.use(express.static(adminPath));


function singlePath(req,res){
  var f = controllers[req.params.c];
  if(!f) return res.send({'errors':'No such handler'});
  f(req,res)
}

app.post('/:c',controllers.authenticator,singlePath);


function doublePath(req,res){
  var f = controllers[req.params.c+"/"+req.params.d];
  if(!f) return res.send({'errors':'No such handler'});
  f(req,res)
}

app.post('/:c/:d',controllers.authenticator,doublePath);

app.listen(config.PORT, function() {
  console.log("Node app is running at localhost:" + config.PORT);
});
