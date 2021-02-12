const mysql = require('mysql');

// const connection = mysql.createConnection({
//   host: process.env.MYSQL_HOST || 'localhost',
//   user: process.env.MYSQL_USER || "root",
//   password: process.env.MYSQL_PASSWORD || "",
//   database: "ablebox"
// });

const connection = mysql.createConnection(process.env.JAWSDB_URL || require('../config.js').jawsDB);

connection.connect();

module.exports.connection = connection;
