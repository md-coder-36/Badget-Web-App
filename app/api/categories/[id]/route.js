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
        const { name, color, icon } = body;

        if (!id) {
            return new NextResponse("Missing ID", { status: 400 });
        }

        // specific validation: verify ownership
        const existing = await prisma.category.findUnique({
            where: { id: id },
        });

        if (!existing || existing.userId !== session.user.id) {
            return new NextResponse("Not Found or Unauthorized", { status: 404 });
        }

        const category = await prisma.category.update({
            where: {
                id: id,
            },
            data: {
                name,
                color,
                icon,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORY_PATCH]", error);
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

        const category = await prisma.category.findUnique({
            where: { id: id },
            include: { _count: { select: { incomes: true, expenses: true, subcategories: true } } }
        });

        if (!category || category.userId !== session.user.id) {
            return new NextResponse("Not Found", { status: 404 });
        }

        if (category.isDefault) {
            return new NextResponse("Cannot delete default category", { status: 400 });
        }

        // Check constraints
        if (category._count.incomes > 0 || category._count.expenses > 0) {
            return new NextResponse("Cannot delete category with existing transactions", { status: 400 });
        }

        await prisma.category.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
