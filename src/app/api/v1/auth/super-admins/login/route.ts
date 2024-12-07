import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";
import { sendOTPVerification } from '@/src/utils/sendOTPVerification.utils'

export async function POST(reqest: Request) {
    try {
        await connectToDatabase()

        if (reqest.method !== "POST") return NextResponse.json({ message: "Method isb not allowed.", success: false }, { status: 405 })

        const { email, password } = await reqest.json()

        if (!email || !password) return NextResponse.json({ message: "All fields are required.", success: false }, { status: 400 })

        const user = await SuperAdmin.findOne({ email })

        if (!user) return NextResponse.json({ message: "User not exist." }, { status: 404 })

        const isPasswordMatched = await user.comparePassword(password)

        if (!isPasswordMatched) return NextResponse.json({ message: "Invalid credential", success: false }, { status: 401 })

        const otpResponse = await sendOTPVerification(user._id.toString(), user.email, "admin");

        return NextResponse.json({ ...otpResponse, success: true }, { status: 200 });

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while login super admin: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error." }, { status: 500 })
    }
}

