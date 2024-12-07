import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import User from "@/src/models/user.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase()

        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { role, status } = authResult;

        if (status === 200 && role !== "admin" && role !== "manager") return NextResponse.json({ message: "You are not authorized to perform this action.", success: false }, { status: 403 })

        if (request.method !== 'GET') return NextResponse.json({ method: 'Method not allowed', success: false }, { status: 405 })

        const { id } = (await params);

        const user = await User.findById(id).select('-password -refreshToken -otp');

        if (!user) return NextResponse.json({ message: "User not found.", success: false }, { status: 404 })

        return NextResponse.json({ data: { user }, success: true }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while getting user: ${error.message}`);
        } else {
            console.error(`Error while getting user: ${error}`);
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}