require('dotenv').config();
const { Pool }       = require('pg');
const { PrismaPg }   = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const isLocal = (process.env.DATABASE_URL || '').includes('localhost');
const pool    = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

module.exports = prisma;
