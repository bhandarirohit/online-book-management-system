const mysql = require('mysql2');


const dbConfig = {
    host: 'localhost',
    user: 'root',           
    password: 'password',   
    database: 'bookhub_db'
};


const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

pool.getConnection((err, connection) => {
    if (err) {
        console.error(' Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL database successfully!');
        connection.release();
    }
});

module.exports = promisePool;