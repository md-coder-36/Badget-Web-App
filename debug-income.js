const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const income = await prisma.income.findMany({
            orderBy: { date: 'desc' },
            include: { category: true }
        });

        console.log('Total Income Entries:', income.length);
        income.forEach(i => {
            console.log(`- ${i.name}: ${i.amount} on ${i.date.toISOString()} (Created: ${i.createdAt.toISOString()})`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
