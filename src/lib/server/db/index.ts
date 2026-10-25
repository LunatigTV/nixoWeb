import {drizzle} from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config();

const host = process.env.DATABASE_HOST || '127.0.0.1';
const port = Number(process.env.DATABASE_PORT) || 3306;
const user = process.env.DATABASE_USER || 'user';
const password = process.env.DATABASE_PASSWORD || '';
const database = process.env.DATABASE_NAME || 'minecraft_stats';

const poolConnection = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const db = drizzle(poolConnection, {schema, mode: 'default'});