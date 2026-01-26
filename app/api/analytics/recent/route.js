import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch latest 5 income and 5 expenses
        const income = await prisma.income.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' },
            take: 5,
            include: { category: true }
        });

        const expenses = await prisma.expense.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' },
            take: 5,
            include: { category: true }
        });

        // Merge and sort
        const combined = [
            ...income.map(i => ({ ...i, type: 'income' })),
            ...expenses.map(e => ({ ...e, type: 'expense' }))
        ].sort((a, b) => {
            const dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff === 0) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return dateDiff;
        })
            .slice(0, 5); // Take top 5 overall

        return NextResponse.json(combined);

    } catch (error) {
        console.error("[ANALYTICS_RECENT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
