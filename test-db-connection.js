const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

const logFile = path.join(__dirname, 'db-test-result.txt');

function log(message) {
    console.log(message);
    fs.appendFileSync(logFile, message + '\n');
}

async function main() {
    try {
        fs.writeFileSync(logFile, 'Starting DB Test...\n');
        log('Connecting to database...');

        const userCount = await prisma.user.count();
        log('Successfully connected to database.');
        log(`User count: ${userCount}`);

        // Also try to fetch one user to verify data access
        const user = await prisma.user.findFirst();
        log(`First user found: ${user ? user.email : 'None'}`);

    } catch (error) {
        log(`Error connecting to database: ${error.message}`);
        console.error('Error connecting to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
