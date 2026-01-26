import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const session = await auth();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { name, categoryId } = body;

        if (!name || !categoryId) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Verify parent category ownership
        const category = await prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category || category.userId !== session.user.id) {
            return new NextResponse("Parent category not found", { status: 404 });
        }

        // Duplicate check
        const existing = await prisma.subcategory.findFirst({
            where: {
                categoryId: categoryId,
                name: name
            }
        });

        if (existing) {
            return new NextResponse("Subcategory already exists", { status: 409 });
        }

        const subcategory = await prisma.subcategory.create({
            data: {
                name,
                categoryId
            },
        });

        return NextResponse.json(subcategory);
    } catch (error) {
        console.error("[SUBCATEGORIES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
