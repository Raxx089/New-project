const allRequire = require('../helpers/allRequire');
const cassandra = allRequire.cassandra;
const cassandraClient = allRequire.cassandraClient;
const queryDbHelper=require('./queryDbHelper');

function getUserByUserName(options,callback){
	queryDbHelper.getAllDataWithRange({
		tableName: 'users',
	  primaryKeys:{username: options.username},
	  partionKey:1
	}, function(err, data){
		if(err) return callback(err);
		if(data.length)
			return callback(null, data[0])
		return callback(null, null);
	});
}

function insertUser(options, callback){
	queryDbHelper.insert({
		tableName: 'users',
	  partionKey: 1,// to resolve mysql shard client
	  username:options.username,
		pass: options.pass,
		name: options.name,
	  columns: ['username', 'pass', 'name']
	}, callback);
}

function fetchuser(options, callback){
	queryDbHelper.getAllDataWithRange({
		tableName: 'users',
		limit: options.limit,
		offset: options.offset,
		partionKey:1,
		selectFields: " username, name, id, status "
	}, callback);
}

module.exports.getUserByUserName = getUserByUserName;
module.exports.insertUser = insertUser;
module.exports.fetchuser = fetchuser;
