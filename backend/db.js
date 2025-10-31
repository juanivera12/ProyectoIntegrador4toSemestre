
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    //CONFIGURAR CON TUS DATOS JUANI
    host: 'localhost',      
    user: 'root',           
    password: 'tu_password',
    database: 'mydb',       
    
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;