import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const { id } = await params;

        const expense = await prisma.expense.findUnique({
            where: { id },
            include: {
                category: true,
                subcategory: true,
            },
        });

        if (!expense || expense.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error("[EXPENSE_GET_ONE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, amount, date, paymentMethod, categoryId, subcategoryId, notes } = body;

        const existing = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const expense = await prisma.expense.update({
            where: {
                id: id,
            },
            data: {
                name,
                amount,
                date: date ? new Date(date) : undefined,
                paymentMethod,
                categoryId,
                subcategoryId,
                notes,
            },
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error("[EXPENSE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const { id } = await params;

        const existing = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        await prisma.expense.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json(existing);
    } catch (error) {
        console.error("[EXPENSE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
