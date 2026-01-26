import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name } = body;

        // Verify ownership via category relation
        const subcategory = await prisma.subcategory.findUnique({
            where: { id },
            include: { category: true }
        });

        if (!subcategory || subcategory.category.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const updated = await prisma.subcategory.update({
            where: { id },
            data: { name }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[SUBCATEGORY_PATCH]", error);
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

        const subcategory = await prisma.subcategory.findUnique({
            where: { id: id },
            include: {
                category: true,
                _count: { select: { incomes: true, expenses: true } }
            }
        });

        if (!subcategory || subcategory.category.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Check constraints
        if (subcategory._count.incomes > 0 || subcategory._count.expenses > 0) {
            return new NextResponse("Cannot delete subcategory with existing transactions", { status: 400 });
        }

        await prisma.subcategory.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json(subcategory);
    } catch (error) {
        console.error("[SUBCATEGORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
