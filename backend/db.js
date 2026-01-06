const mysql = require('mysql2');
require('dotenv').config();

// Create MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'abcd',
    multipleStatements: true
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err.message);
        console.log('Make sure:');
        console.log('1. XAMPP MySQL is running');
        console.log('2. Database "abcd" exists');
        console.log('3. Connection details are correct');
        return;
    }
    console.log('Connected to MySQL database successfully!');
    console.log('Database:', process.env.DB_NAME || 'abcd');
});

// Handle connection errors
connection.on('error', (err) => {
    console.error('MySQL connection error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        console.log('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
        console.log('Database connection was refused.');
    }
});

module.exports = connection;