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
        const categoryId = searchParams.get("categoryId");
        const paymentMethod = searchParams.get("paymentMethod");

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

        if (paymentMethod) {
            where.paymentMethod = paymentMethod;
        }

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                category: true,
                subcategory: true,
            },
            orderBy: {
                date: 'desc'
            }
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("[EXPENSES_GET]", error);
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
        const { name, amount, date, paymentMethod, categoryId, subcategoryId, notes } = body;

        if (!name || !amount || !date || !categoryId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify category ownership
        const category = await prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category || category.userId !== session.user.id || category.type !== 'expense') {
            return new NextResponse("Invalid expense category", { status: 400 });
        }

        const expense = await prisma.expense.create({
            data: {
                name,
                amount,
                date: new Date(date),
                paymentMethod: paymentMethod || 'cash',
                categoryId,
                subcategoryId,
                notes,
                userId: session.user.id,
            },
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error("[EXPENSES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
