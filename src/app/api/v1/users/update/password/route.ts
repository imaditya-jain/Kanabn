import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import User from "@/src/models/user.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function POST(req: Request) {
    try {
        await connectToDatabase()

        const authResult = await authMiddleware(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { id, role: userRole, status } = authResult;

        if (status !== 200 || (userRole !== "admin" && userRole !== "manager" && userRole !== "employee")) return NextResponse.json({ message: "You are not authorized to perform this action.", success: false }, { status: 403 })

        if (req.method !== "POST") return NextResponse.json({ message: "Method is not allowed.", success: false }, { status: 405 })

        const { oldPassword, newPassword } = await req.json();

        const user = await User.findById(id);

        if (!user) return NextResponse.json({ message: "User not found.", success: false }, { status: 404 })

        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) return NextResponse.json({ message: "Invalid old password.", success: false }, { status: 401 })

        user.password = newPassword;
        await user.save();

        return NextResponse.json({ message: "Password changed successfully.", success: true }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while update password user: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}