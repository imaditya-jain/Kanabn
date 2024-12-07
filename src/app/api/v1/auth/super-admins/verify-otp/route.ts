import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";
import { generateRefreshAndAccessToken } from "@/src/utils/generateRefreshAndAccessToken";

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        if (request.method !== "POST") {
            return NextResponse.json(
                { message: "Method not allowed.", success: false },
                { status: 405 }
            );
        }

        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { message: "All fields are required.", success: false },
                { status: 400 }
            );
        }

        const user = await SuperAdmin.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { message: "User does not exist.", success: false },
                { status: 404 }
            );
        }

        const isOTPMatched = await user.compareOTP(otp);
        if (!isOTPMatched) {
            return NextResponse.json(
                { message: "Invalid OTP.", success: false },
                { status: 403 }
            );
        }

        const tokens = await generateRefreshAndAccessToken(user._id.toString(), "admin");
        if (!tokens) {
            return NextResponse.json(
                { message: "Failed to generate tokens.", success: false },
                { status: 500 }
            );
        }

        const { accessToken, refreshToken } = tokens;

        const loggedUser = await SuperAdmin.findByIdAndUpdate(user._id, { $set: { otp: null, isVerified: true }, }).select('-password -otp -refreshToken')

        const response = NextResponse.json(
            { data: { message: "OTP verified successfully.", user: loggedUser, success: true } },
            { status: 200 }
        );

        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "strict",
        });
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "strict",
        });

        return response;
    } catch (error) {
        console.error(
            "Error while logging in super admin with OTP verification:",
            error
        );
        return NextResponse.json(
            { message: "Internal server error.", success: false },
            { status: 500 }
        );
    }
}
