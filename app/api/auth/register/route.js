import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request) {
    try {
        const { name, email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists with this email" },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: name || null,
                email,
                passwordHash,
            },
        });

        // Create default categories for the user
        const defaultIncomeCategories = [
            { name: "Employment", icon: "💼", color: "#1890ff" },
            { name: "Business", icon: "💰", color: "#52c41a" },
            { name: "Investments", icon: "📈", color: "#722ed1" },
            { name: "Other", icon: "💵", color: "#faad14" },
        ];

        const defaultExpenseCategories = [
            { name: "Housing", icon: "🏠", color: "#f5222d" },
            { name: "Transportation", icon: "🚗", color: "#fa8c16" },
            { name: "Food", icon: "🍔", color: "#faad14" },
            { name: "Utilities", icon: "💡", color: "#13c2c2" },
            { name: "Entertainment", icon: "🎬", color: "#722ed1" },
            { name: "Healthcare", icon: "🏥", color: "#eb2f96" },
            { name: "Education", icon: "📚", color: "#1890ff" },
            { name: "Shopping", icon: "🛍️", color: "#fa541c" },
            { name: "Other", icon: "📋", color: "#8c8c8c" },
        ];

        // Create income categories
        await prisma.category.createMany({
            data: defaultIncomeCategories.map((cat) => ({
                ...cat,
                type: "income",
                isDefault: true,
                userId: user.id,
            })),
        });

        // Create expense categories
        await prisma.category.createMany({
            data: defaultExpenseCategories.map((cat) => ({
                ...cat,
                type: "expense",
                isDefault: true,
                userId: user.id,
            })),
        });

        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                message: "User created successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error full details:", error);
        return NextResponse.json(
            { error: "Failed to create user: " + error.message },
            { status: 500 }
        );
    }
}
