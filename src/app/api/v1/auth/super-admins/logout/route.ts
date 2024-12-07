import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function POST(request: Request) {
    await connectToDatabase();

    const authResult = await authMiddleware(request);
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const { id: superAdminId, role: userRole, status } = authResult;

    if (status === 200 && (userRole === undefined || (userRole !== "admin" && userRole !== "manager"))) {
        return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });
    }

    try {
        const superAdmin = await SuperAdmin.findById(superAdminId);

        if (!superAdmin) return NextResponse.json({ message: "Super admin not found.", success: false }, { status: 404 })

        await SuperAdmin.findByIdAndUpdate(superAdminId, { $set: { refreshToken: null } })

        const response = NextResponse.json({ message: "Super admin is logged out.", success: true }, { status: 200 });

        response.cookies.set("accessToken", "", {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "strict",
            expires: new Date(0),
        });
        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "strict",
            expires: new Date(0),
        });

        return response

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while logout super admin: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error." }, { status: 500 })
    }
}