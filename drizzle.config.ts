import {defineConfig} from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    schema: './src/lib/server/db/schema.ts',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DATABASE_HOST || '127.0.0.1',
        port: Number(process.env.DATABASE_PORT) || 3306,
        user: process.env.DATABASE_USER || 'user',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'minecraft_stats'
    }
});