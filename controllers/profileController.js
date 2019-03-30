const allRequire = require('../helpers/allRequire');

const unsecurePaths = {
	'signup':true,
	'login': true
}
const sha1 = require('sha1');
const ACTIVE_USER = 1
const DELETED_USER = 0;

function authenticator(req,res,next){
	req.session.lastRefreshed=parseInt(Date.now()/3600000);

	if(unsecurePaths[req.params.c])
		return next();
	if(req.session.isLoggedIn){
		return next();
	}
	return res.send({errors: "UNAUTHORIZED"});
}

function signup(req, res){
	let name = req.body.name;
	if(!name)
		return res.send({errors: "Invalid name"});
	let pass = req.body.pass;
	if( ! pass)
		return res.send({errors: "Invalid pass"});
	let username =  req.body.username;
	validate(username, function(er, data){
		if(er)
			return res.send({errors: er})
		allRequire.models.insertUser({
			username: username,
			name: name,
			pass: sha1(pass),
			status: ACTIVE_USER
		}, function(err, response){
			if(err) {
				console.log(err);
				return res.send({errors: "Internal database error"});
			}
			return res.send({results: 1, msg: "Sign up done"});
		});
	})

}

function validate(username, callback){
	if( ! username)
		return callback('Invalid username');
	allRequire.models.getUserByUserName({
		username: username
	}, function(err, data){
		if(err)
			return callback("Internal Error: Cause Database model error");
		if(data)
			return callback("user with same username exists, please user some other username");
		return callback(null, 1)
	});
}

function login(req, res){
	let username = req.body.username;
	if( ! username)
		return res.send({errors: "Invalid username"});

	let userpass = req.body.pass;
	if( ! userpass)
		return res.send({errors: "Invalid pass"});
	allRequire.models.getUserByUserName({username: username}, function(err, data){
		if(err)
			return callback("Internal Error: Cause Database model error");
		if(data && data['pass'] === sha1(userpass)){
			req.session.isLoggedIn = 1;
			req.session.uId = data.id;
			req.session.name = data.name;
			req.session.username= data.username;
			return res.send({results: 1, msg: "Welcome " + data.name + ", you have been logged in.", userInfo: {
				name: data.name,
				id: data.id,
				username: data.username
			}});
		}
		return res.send({errors: "No such user found"});
	});
}

function checkloggedin(req, res){
	return res.send({results: 1, msg: "Welcome " + req.session.name + ", you have been logged in.", userInfo: {
		name: req.session.name,
		id: req.session.uId,
		username: req.session.username
	}});
}

function fetchuser(req, res){
	let p = req.body.p;
	p = parseInt(p) ? parseInt(p): 0;
	allRequire.models.fetchuser({limit : 4, offset: 0*p}, function(err, users){
		if(err){
			return callback("Internal Error: Cause Database model error");
		}
		return res.send({results: users, msg: "Users fetched "});
	});
}
module.exports.authenticator = authenticator;
module.exports.login = login;
module.exports.signup = signup;
module.exports.fetchuser = fetchuser;
module.exports.checkloggedin=checkloggedin;
