const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: "ablebox"
});

connection.connect();

module.exports.connection = connection;
