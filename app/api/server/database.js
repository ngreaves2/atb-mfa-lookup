import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config({ path: '../../../.env' });
const { Pool } = pkg;

class Database {
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 5432,
            max: process.env.DB_MAX_CONNECTIONS || 10,
            idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
            connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT || 2000,
        });

        // Handle unexpected errors in the pool
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
        
        //this.pool.on();
    }

    // Query method using async/await
    async query(text, params = []) {
        const client = await this.pool.connect();

        try {
            console.log("[Database] Recieved Query: " + text);
            const { rows } = await client.query(text, params);
            // const { rows } = await client.query("SELECT * FROM atb WHERE name ILIKE '%noah%';");
            console.log("[Database] Rows: " + JSON.stringify(rows));
            return rows;
        } catch (err) {
            console.error('Query Error:', err.stack);
            throw err;
        } finally {
            client.release();
        }
    }

    // Close the database pool
    async close() {
        console.log('Closing database connection pool...');
        await this.pool.end();
        console.log('Database pool closed.');
    }
}

// Export as a singleton instance
const db = new Database();
export default db;
