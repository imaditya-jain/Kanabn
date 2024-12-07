import { NextResponse } from 'next/server'
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

        const { id: userId, role: userRole, status } = authResult;

        if (status === 200 && userRole === "admin") return NextResponse.json({ message: "You are not authorized to perform this action.", success: false }, { status: 403 })

        const user = await User.findById(userId).exec();

        if (!user) return NextResponse.json({ message: "User not found.", success: false }, { status: 404 })

        await User.findByIdAndUpdate(userId, {
            $set: { refreshToken: null }
        })

        const response = NextResponse.json({ message: "User is logged out.", success: true }, { status: 200 });

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
            console.error(`Error while logout user: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}