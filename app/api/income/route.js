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
        const startDate = searchParams.get("startDate"); // ISO String
        const endDate = searchParams.get("endDate");     // ISO String
        const categoryId = searchParams.get("categoryId");

        const where = {
            userId: session.user.id,
        };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const income = await prisma.income.findMany({
            where,
            include: {
                category: true,
                subcategory: true,
            },
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json(income);
    } catch (error) {
        console.error("[INCOME_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { name, amount, date, frequency, categoryId, subcategoryId, notes } = body;

        if (!name || !amount || !date || !categoryId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify category ownership
        const category = await prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category || category.userId !== session.user.id || category.type !== 'income') {
            return new NextResponse("Invalid income category", { status: 400 });
        }

        const income = await prisma.income.create({
            data: {
                name,
                amount,
                date: new Date(date),
                frequency: frequency || 'one-time',
                categoryId,
                subcategoryId,
                notes,
                userId: session.user.id,
            },
        });

        return NextResponse.json(income);
    } catch (error) {
        console.error("[INCOME_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
