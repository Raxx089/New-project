const config = require('./config');
const express = require ('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const async = require('async');
const multer  = require('multer')
const mime = require('mime');
const mysql = require('mysql');
const mysqlClient  = mysql.createPool(config.mysqlOptions);

module.exports.mysqlClient=mysqlClient;
module.exports.config = config;
module.exports.express = express;
module.exports.bodyParser=bodyParser;
module.exports.cookieSession=cookieSession;
module.exports.async=async;
module.exports.multer=multer;
module.exports.mime = mime;


const models = require('../models');
module.exports.models=models;
