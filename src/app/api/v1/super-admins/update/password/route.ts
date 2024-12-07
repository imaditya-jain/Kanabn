import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function POST(request: Request) {
    try {
        await connectToDatabase()

        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { id, role, status } = authResult;

        if (status !== 200 || role !== "admin") return NextResponse.json({ message: "You are not authorized to perform this action.", success: false }, { status: 403 })

        if (request.method !== "POST") return NextResponse.json({ message: "Method is not allowed.", success: false }, { status: 405 })

        const { oldPassword, newPassword } = await request.json();

        const superAdmin = await SuperAdmin.findById(id);

        if (!superAdmin) return NextResponse.json({ message: "Super admin not found.", success: false }, { status: 404 });

        const isPasswordMatch = await superAdmin.comparePassword(oldPassword);

        if (!isPasswordMatch) return NextResponse.json({ message: "Invalid old password.", success: false }, { status: 401 });

        superAdmin.password = newPassword;
        await superAdmin.save();

        return NextResponse.json({ message: "Password changed successfully.", success: true }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while change password super admin: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }

        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}