import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const type = searchParams.get("type"); // 'income' or 'expense'

        if (!startDate || !endDate || !type) {
            return new NextResponse("Missing parameters", { status: 400 });
        }

        const where = {
            userId: session.user.id,
            date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
            },
        };

        let data;

        if (type === 'income') {
            const incomeGroups = await prisma.income.groupBy({
                by: ['categoryId'],
                where,
                _sum: { amount: true },
            });

            // Fetch category details manually or join if possible 
            // groupBy doesn't support include/relations directly in same query efficiently in all DBs
            // So we fetch categories and map
            const categories = await prisma.category.findMany({
                where: { id: { in: incomeGroups.map(g => g.categoryId) } }
            });

            data = incomeGroups.map(group => {
                const cat = categories.find(c => c.id === group.categoryId);
                return {
                    name: cat ? cat.name : 'Unknown',
                    color: cat ? cat.color : '#ccc',
                    value: group._sum.amount || 0
                };
            });

        } else {
            const expenseGroups = await prisma.expense.groupBy({
                by: ['categoryId'],
                where,
                _sum: { amount: true },
            });

            const categories = await prisma.category.findMany({
                where: { id: { in: expenseGroups.map(g => g.categoryId) } }
            });

            data = expenseGroups.map(group => {
                const cat = categories.find(c => c.id === group.categoryId);
                return {
                    name: cat ? cat.name : 'Unknown',
                    color: cat ? cat.color : '#ccc',
                    value: group._sum.amount || 0
                };
            });
        }

        // Sort by value desc
        data.sort((a, b) => b.value - a.value);

        return NextResponse.json(data);

    } catch (error) {
        console.error("[ANALYTICS_CATEGORIES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
