import dotenv from 'dotenv';
import sql from 'mssql';

if (process.env.DB_HOST === undefined) {
    dotenv.config();
}

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '1433'),  // Puerto por defecto 1433
    options: {
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', 
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Crear el pool de conexiones
const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool.connect();  // Inicia la conexión

// Manejo de errores
pool.on('error', err => {
    console.error('Error en el pool de SQL Server:', err);
});

// Exportar tanto el pool como la conexión y sql para tipos de datos
export default {
    sql,
    pool,
    poolConnect
};