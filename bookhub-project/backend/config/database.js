const mysql = require('mysql2');

// Database configuration for your Mac
const dbConfig = {
    host: 'localhost',
    user: 'root',           // Your MySQL username
    password: 'password',   // Your MySQL password - CHANGE THIS!
    database: 'bookhub_db'
};

// Create connection pool
const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Create a promise wrapper for the pool
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL database successfully!');
        connection.release();
    }
});

module.exports = promisePool;