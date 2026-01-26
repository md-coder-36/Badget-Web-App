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
        // const type = searchParams.get("type"); // Optional: 'income' or 'expense'

        if (!startDate || !endDate) {
            return new NextResponse("Missing date range parameters", { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const where = {
            userId: session.user.id,
            date: {
                gte: start,
                lte: end,
            },
        };

        // Fetch Income
        const income = await prisma.income.findMany({
            where,
            include: { category: true, subcategory: true },
            orderBy: { date: 'desc' }
        });

        // Fetch Expense
        const expenses = await prisma.expense.findMany({
            where,
            include: { category: true, subcategory: true },
            orderBy: { date: 'desc' }
        });

        // Combine
        const combined = [
            ...income.map(i => ({ ...i, type: 'income' })),
            ...expenses.map(e => ({ ...e, type: 'expense' }))
        ];

        // Sort by Date Descending
        combined.sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff === 0) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return dateDiff;
        });

        return NextResponse.json(combined);

    } catch (error) {
        console.error("[TRANSACTIONS_API]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
