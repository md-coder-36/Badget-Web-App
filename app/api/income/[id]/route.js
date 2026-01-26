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

        const income = await prisma.income.findUnique({
            where: { id },
            include: {
                category: true,
                subcategory: true,
            },
        });

        if (!income || income.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(income);
    } catch (error) {
        console.error("[INCOME_GET_ONE]", error);
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
        const { name, amount, date, frequency, categoryId, subcategoryId, notes } = body;

        const existing = await prisma.income.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const income = await prisma.income.update({
            where: {
                id: id,
            },
            data: {
                name,
                amount,
                date: date ? new Date(date) : undefined,
                frequency,
                categoryId,
                subcategoryId,
                notes,
            },
        });

        return NextResponse.json(income);
    } catch (error) {
        console.error("[INCOME_PATCH]", error);
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

        const existing = await prisma.income.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        await prisma.income.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json(existing);
    } catch (error) {
        console.error("[INCOME_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
