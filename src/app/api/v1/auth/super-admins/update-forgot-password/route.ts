import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";

export async function PATCH(req: Request) {
    try {

        await connectToDatabase()

        if (req.method !== "PATCH") return NextResponse.json({ message: "Method is not allowed.", success: false }, { status: 405 })

        const { email, otp, password } = await req.json()

        if (!email || !otp || !password) return NextResponse.json({ message: "All fields are required.", success: false }, { status: 400 })

        const superAdmin = await SuperAdmin.findOne({ email })

        if (!superAdmin) return NextResponse.json({ message: "User not exist." }, { status: 404 })

        const isOTPMatched = await superAdmin.compareOTP(otp)

        if (!isOTPMatched) return NextResponse.json({ message: "Invalid OTP.", success: false }, { status: 401 })

        superAdmin.password = password
        await superAdmin.save()

        return NextResponse.json({ message: "Password updated successfully.", success: true }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while update forgot password super admin: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}