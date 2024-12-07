import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import User from "@/src/models/user.model";

export async function POST(req: Request) {
    try {
        await connectToDatabase()

        if (req.method !== "POST") return NextResponse.json({ message: "Method is not allowed.", success: false }, { status: 405 })

        const { email, otp, password } = await req.json()

        if (!email || !otp || !password) return NextResponse.json({ message: "All fields are required.", success: false }, { status: 400 })

        const user = await User.findOne({ email })

        if (!user) return NextResponse.json({ message: "User not exist.", success: false }, { status: 404 })

        const isOTPMatched = await user.compareOTP(otp)

        if (!isOTPMatched) return NextResponse.json({ message: "Invalid OTP.", success: false }, { status: 401 })

        user.password = password
        await user.save()

        return NextResponse.json({ message: "Password updated successfully.", success: true }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while update forgot password user: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}