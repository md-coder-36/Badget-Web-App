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
        // period can be used for pre-set logic, but here we expect ISO dates

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

        // Calculate Totals using Aggregate
        // Note: Prisma aggregate on Float/Decimal
        // Income
        const incomeAgg = await prisma.income.aggregate({
            where,
            _sum: { amount: true }
        });

        // Expense
        const expenseAgg = await prisma.expense.aggregate({
            where,
            _sum: { amount: true }
        });

        const totalIncome = incomeAgg._sum.amount || 0;
        const totalExpenses = expenseAgg._sum.amount || 0;

        const netBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0
            ? ((netBalance / totalIncome) * 100)
            : 0;

        return NextResponse.json({
            totalIncome,
            totalExpenses,
            netBalance,
            savingsRate
        });

    } catch (error) {
        console.error("[ANALYTICS_SUMMARY]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
