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
        const type = searchParams.get("type"); // 'income' or 'expense'

        const where = {
            userId: session.user.id,
        };

        if (type) {
            where.type = type;
        }

        const categories = await prisma.category.findMany({
            where,
            include: {
                subcategories: true,
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
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
        const { name, type, color, icon } = body;

        if (!name || !type) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        if (type !== 'income' && type !== 'expense') {
            return new NextResponse("Invalid type", { status: 400 });
        }

        // Check for duplicate name for this user/type
        const existing = await prisma.category.findFirst({
            where: {
                userId: session.user.id,
                name: name,
                type: type
            }
        });

        if (existing) {
            return new NextResponse("Category already exists", { status: 409 });
        }

        const category = await prisma.category.create({
            data: {
                name,
                type,
                color: color || (type === 'income' ? '#52c41a' : '#f5222d'), // Default colors
                icon,
                userId: session.user.id,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORIES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
