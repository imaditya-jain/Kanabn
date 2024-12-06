import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import User from "@/src/models/user.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { role, status } = authResult;

        if (status === 200 && role !== "admin" && role !== "manager") {
            return NextResponse.json(
                { message: "You are not authorized to perform this action.", success: false },
                { status: 403 }
            );
        }

        if (request.method !== 'GET') return NextResponse.json({ method: 'Method not allowed', success: false }, { status: 405 })

        const users = await User.find().select('-password -refreshToken -otp');

        if (!users) return NextResponse.json({ message: "Please create a user first." }, { status: 200 })

        return NextResponse.json({ data: { users }, success: true }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while getting users: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}