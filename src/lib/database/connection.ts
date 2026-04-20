import { env } from '$env/dynamic/private'

import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
        host:env.DB_HOST,
        user:env.DB_USER,
        password:env.DB_PASSWORD,
        database:env.DB_NAME,
        connectionLimit: 10
});
