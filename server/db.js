const sql = require("mssql");


// ==========================================
// SQL SERVER CONFIGURATION
// ==========================================

const dbConfig = {

    server: process.env.DB_SERVER,

    database: process.env.DB_DATABASE,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    port: parseInt(
        process.env.DB_PORT || "1433",
        10
    ),

    options: {

        encrypt: false,

        trustServerCertificate: true

    },

    pool: {

        max: 10,

        min: 0,

        idleTimeoutMillis: 30000

    }

};


// ==========================================
// CREATE CONNECTION POOL
// ==========================================

const poolPromise = new sql.ConnectionPool(
    dbConfig
)
    .connect()
    .then(pool => {

        console.log(
            "================================="
        );

        console.log(
            "SQL SERVER CONNECTED"
        );

        console.log(
            "Database:",
            process.env.DB_DATABASE
        );

        console.log(
            "================================="
        );

        return pool;

    })
    .catch(error => {

        console.error(
            "SQL SERVER CONNECTION ERROR:"
        );

        console.error(error);

        throw error;

    });


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    sql,

    poolPromise

};