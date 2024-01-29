const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'usuario',
    password: 'minhasenha',
    database: 'apiJavascript'
});

module.exports = connection;