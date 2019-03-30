------------------------------------------
****** For Staging  CREATE DATABASE IF NOT EXISTS `test_v1`;
------------------------------------------
create table users(
   id INT NOT NULL AUTO_INCREMENT,
   name VARCHAR(100) NOT NULL,
   pass VARCHAR(255) NOT NULL,
   username VARCHAR(255) NOT NULL,
   status TINYINT DEFAULT 1,
   PRIMARY KEY ( id )
);
