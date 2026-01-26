import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import dayjs from 'dayjs';

export async function GET(request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") || '30d'; // 7d, 30d, 1y

        let startDate = dayjs();
        let dateFormat = 'YYYY-MM-DD';

        if (period === '7d') startDate = startDate.subtract(7, 'day');
        else if (period === '30d') startDate = startDate.subtract(30, 'day');
        else if (period === '1y') {
            startDate = startDate.subtract(1, 'year');
            dateFormat = 'YYYY-MM'; // Group by month for year view
        }

        const where = {
            userId: session.user.id,
            date: {
                gte: startDate.toDate(),
            },
        };

        // Get raw data and aggregate in JS for simplicity (Prisma doesn't support date_trunc easily across all DBs)
        const income = await prisma.income.findMany({
            where,
            select: { date: true, amount: true }
        });

        const expenses = await prisma.expense.findMany({
            where,
            select: { date: true, amount: true }
        });

        // Aggregate
        const map = new Map();

        // Helper to init map
        // We want to fill potentially empty dates? 
        // For now, let's just group existing data. Charts usually handle sparse data or we can fill 0s.

        // Fill map with 0s for the range (optional but better for charts)
        // Generating range:
        let current = startDate;
        const end = dayjs();
        while (current.isBefore(end) || current.isSame(end, 'day')) {
            const key = current.format(dateFormat);
            if (!map.has(key)) map.set(key, { date: key, income: 0, expense: 0 });
            current = current.add(1, period === '1y' ? 'month' : 'day');
        }

        income.forEach(i => {
            const key = dayjs(i.date).format(dateFormat);
            if (map.has(key)) {
                const entry = map.get(key);
                entry.income += Number(i.amount);
            }
        });

        expenses.forEach(e => {
            const key = dayjs(e.date).format(dateFormat);
            if (map.has(key)) {
                const entry = map.get(key);
                entry.expense += Number(e.amount);
            }
        });

        const result = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json(result);

    } catch (error) {
        console.error("[ANALYTICS_HISTORY]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
