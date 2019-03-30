const allRequire = require('../helpers/allRequire');

/*
  options=>{
  tableName: '',
  primaryKeys:{} //where clauses
  partionKey:value // to resolve shard
  key:values // ,
  columns: [] // to be updated
}
*/

function update(options, callback){
  var primaryKeysArr = Object.keys(options.primaryKeys);
  var query = 'UPDATE '+options.tableName+' SET ';
  var columns = options.columns;
  var params = [];
  for(var i = 0; i < columns.length; i++){
    query += columns[i]+' = ?,';
    params.push(options[columns[i]]);
  }
  query = query.slice(0,-1);
  query += ' WHERE ';
  for(var i=0;i<primaryKeysArr.length;i++){
    if(Array.isArray(options.primaryKeys[primaryKeysArr[i]])){
      query += partionKeysArr[i]+' IN (';
      for(var j = 0; j < options.primaryKeys[primaryKeysArr[i]].length; j++){
        query += '?,';
        params.push(options.primaryKeys[primaryKeysArr[i]][j]);
      }
      query = query.slice(0,-1) + ') AND ';
    } else {
      query += primaryKeysArr[i]+' =? AND ';
      params.push(options.primaryKeys[primaryKeysArr[i]]);
    }
  }
  query = query.slice(0,-4);
  makeQueryRequest({sql: query, params: params, partionKey: options.partionKey, tableName: options.tableName}, callback);
}

/*
  options=>{
  tableName: '',
  primaryKeys:{} //where clauses
  partionKey:value // to resolve shard
}
*/
function getAllDataWithRange(options, callback){
  let selectFields = options.selectFields ? options.selectFields : "*"
  var query = "SELECT " +selectFields+ " FROM " + options.tableName + ' WHERE 1 AND ';
  var params = [];

  if(options.primaryKeys){
    var primaryKeysArr = Object.keys(options.primaryKeys);
    for(var i=0;i<primaryKeysArr.length;i++){
      if(Array.isArray(options.primaryKeys[primaryKeysArr[i]])){
        query += primaryKeysArr[i]+' IN (';
        for(var j = 0; j < options.primaryKeys[primaryKeysArr[i]].length; j++){
          query += '?,';
          params.push(options.primaryKeys[primaryKeysArr[i]][j]);
        }
        query = query.slice(0,-1) + ') AND ';
      } else {
        query += primaryKeysArr[i]+' =? AND ';
        params.push(options.primaryKeys[primaryKeysArr[i]]);
      }
    }
  }
  if(options.clusteringKeys){
    for(var i = 0; i < options.clusteringKeys.length; i++){
      query += options.clusteringKeys[i].name + " " + options.clusteringKeys[i].sign + " ? AND ";
      params.push(options.clusteringKeys[i].value);
    }
  }
  query = query.slice(0,-4);

  if(options.orderBy){
    query += " ORDER BY " + options.orderBy.key + " " + ((options.orderBy.type) ? options.orderBy.type : " ASC ");
  }

  if(options.offset && options.limit){
    query += " LIMIT ?,?";
    params.push(options.offset, options.limit);
  } else if(options.limit){
    query += " LIMIT ?";
    params.push(options.limit);
  }
  makeQueryRequest({sql: query, params: params, tableName: options.tableName, partionKey: options.partionKey}, callback);
}

/*
  options=>{
  tableName: '',
  partionKey:value // to resolve mysql shard client
  key:values // ,
  columns: [] // to be updated
}
*/
function insert(options, callback){
	var query= 'INSERT INTO '+options.tableName+' ( ';
	var params = [];
  var columns=options.columns;

  for(var i = 0; i < columns.length; i++){
    query += columns[i]+',';
    params.push(options[columns[i]]);
  }

	query = query.slice(0,-1)+' ) VALUES( ';
	for(var i=0;i<columns.length;i++){
		query+='?,';
	}
	query = query.slice(0,-1)+' );';
  makeQueryRequest({tableName: options.tableName, partionKey: options.partionKey, sql: query, params: params}, callback);
}

function makeQueryRequest(options, callback){
  resolveClient({tableName:options.tableName, partionKey: options.partionKey}).query(options.sql, options.params, function(err, data, fields){
    callback(err, data);
  });
}

/*
* Resolve client based on partionKey keyval and table
*/
function resolveClient(options){
  return allRequire.mysqlClient;
}

/**
* Use only when necessary
*  options=>{
*   tableName: '',
*   primaryKeys:{} //where clauses
*   partionKey:value // to resolve shard
*   key:values // ,
*   columns: [] // to be updated
* }
**/
function upsert(options, callback){
  update(options, function (err, data){
    if( ! err && data.affectedRows)
      return callback(null, data);

    var primaryKeys = options.primaryKeys;
    delete(options.primaryKeys);

    for(key in primaryKeys){
      options.columns.push(key);
      options[key] = primaryKeys[key];
    }
    insert(options, callback);
  });
}

function incrUpsert(options, callback){
  var primaryKeysArr = Object.keys(options.primaryKeys);
  var query = 'UPDATE '+options.tableName+' SET ';
  var columns = options.columns;
  var params = [];
  for(var i = 0; i < columns.length; i++){
    if (options[columns[i]]){
      query += columns[i]+' = ?,';
      params.push(options[columns[i]]);
    } else {
      options[columns[i]] = 1;
      query += columns[i]+' = '+columns[i]+' + 1 ,';
    }
  }
  query = query.slice(0,-1);
  query += ' WHERE ';
  for(var i=0;i<primaryKeysArr.length;i++){
    if(Array.isArray(options.primaryKeys[primaryKeysArr[i]])){
      query += partionKeysArr[i]+' IN (';
      for(var j = 0; j < options.primaryKeys[primaryKeysArr[i]].length; j++){
        query += '?,';
        params.push(options.primaryKeys[primaryKeysArr[i]][j]);
      }
      query = query.slice(0,-1) + ') AND ';
    } else {
      query += primaryKeysArr[i]+' =? AND ';
      params.push(options.primaryKeys[primaryKeysArr[i]]);
    }
  }
  query = query.slice(0,-4);
  makeQueryRequest({sql: query, params: params, partionKey: options.partionKey, tableName: options.tableName}, function(err, data){
    if( ! err && data.affectedRows)
      return callback(null, data);

    var primaryKeys = options.primaryKeys;
    delete(options.primaryKeys);

    for(key in primaryKeys){
      options.columns.push(key);
      options[key] = primaryKeys[key];
    }
    insert(options, callback);
  });
}

module.exports.update=update;
module.exports.getAllDataWithRange=getAllDataWithRange;
module.exports.insert=insert;
module.exports.upsert=upsert;
module.exports.incrUpsert=incrUpsert;
