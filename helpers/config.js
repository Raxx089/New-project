var config = {};
config.COOKIE_NAME='site_token';
config.otp_expiry_time = 72*3600*60*1000;
config.PORT=8080;
if(process.env.PORT) config.PORT = Number(process.env.PORT);

config.SECRET = 'abc123';
if(process.env.SECRET) config.SECRET = process.env.SECRET;

config.mysqlOptions={
	connectionLimit: 10,
	host: process.env.MYSQL_HOST?process.env.MYSQL_HOST:'localhost',
	user: process.env.MYSQL_USER?process.env.MYSQL_USER:'root',
	password: process.env.MYSQL_PASS?process.env.MYSQL_PASS:'rahul@123',
	database: process.env.MYSQL_DB?process.env.MYSQL_DB:'test_v1'
}
module.exports=config;
