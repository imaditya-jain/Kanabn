import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";
import { sendOTPVerification } from "@/src/utils/sendOTPVerification.utils";

export async function POST(req: Request) {
    try {
        await connectToDatabase()

        if (req.method !== "POST") return NextResponse.json({ message: "Method is not allowed.", success: false }, { status: 405 })

        const { email } = await req.json()

        if (!email) return NextResponse.json({ message: "All fields are required.", success: false }, { status: 400 })

        const superAdmin = await SuperAdmin.findOne({ email })

        if (!superAdmin) return NextResponse.json({ message: "User not exist." }, { status: 404 })

        const otpResponse = await sendOTPVerification(superAdmin._id.toString(), superAdmin.email, "admin");

        return NextResponse.json({ ...otpResponse, success: true }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while forgot password super admin: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}