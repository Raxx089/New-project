const profileController = require('./profileController');
module.exports.authenticator = profileController.authenticator
module.exports.login = profileController.login;
module.exports.signup = profileController.signup;
module.exports.fetchuser = profileController.fetchuser;
module.exports.checkloggedin = profileController.checkloggedin;
