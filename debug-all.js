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
            console.log(`- [INCOME] ${i.name}: ${i.amount} on ${i.date.toISOString()} (Created: ${i.createdAt.toISOString()})`);
        });

        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' },
            include: { category: true }
        });

        console.log('\nTotal Expense Entries:', expenses.length);
        expenses.forEach(e => {
            console.log(`- [EXPENSE] ${e.name}: ${e.amount} on ${e.date.toISOString()} (Created: ${e.createdAt.toISOString()})`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
