import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import User from "@/src/models/user.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function DELETE(req: Request) {
    try {
        await connectToDatabase();

        const authResult = await authMiddleware(req);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { role: userRole, status } = authResult;

        if (status === 200 && userRole !== "admin" && userRole !== "manager") return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });

        if (req.method !== 'DELETE') return NextResponse.json({ method: 'Method not allowed', success: false }, { status: 405 })

        const { ids } = await req.json();

        if (ids && Array.isArray(ids) && ids.length > 0) {
            await User.deleteMany({ _id: { $in: ids } });
            return NextResponse.json({ message: "Users deleted successfully.", success: true }, { status: 200 })
        } else {
            await User.deleteMany({})
            return NextResponse.json({ message: "All users deleted successfully.", success: true }, { status: 200 })
        }

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while delete user: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}