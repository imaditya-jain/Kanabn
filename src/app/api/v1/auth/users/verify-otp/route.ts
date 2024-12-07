import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import User from "@/src/models/user.model";
import { generateRefreshAndAccessToken } from "@/src/utils/generateRefreshAndAccessToken";
import Company from "@/src/models/company.model";
import WorkReport from "@/src/models/workReport.model";
import Project from "@/src/models/project.model";
import Task from "@/src/models/task.model";
import Team from "@/src/models/team.model";
import Attendance from "@/src/models/attendance.model";
import Leave from "@/src/models/leaves.model";

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        if (request.method !== "POST") return NextResponse.json({ message: "Method is not allowed.", success: false }, { status: 405 })

        const { email, otp } = await request.json()

        if (!email || !otp) return NextResponse.json({ message: "All fields are required.", success: false }, { status: 400 })

        const user = await User.findOne({ email })

        if (!user) return NextResponse.json({ message: "User does not exist.", success: false }, { status: 404 })

        const isOTPMatched = await user.compareOTP(otp)

        if (!isOTPMatched) return NextResponse.json({ message: "Invalid OTP.", success: false }, { status: 401 })

        const tokens = await generateRefreshAndAccessToken(user._id.toString(), "user");
        if (!tokens) {
            return NextResponse.json(
                { message: "Failed to generate tokens.", success: false },
                { status: 500 }
            );
        }

        const { accessToken, refreshToken } = tokens;

        const loggedUser = await User.findByIdAndUpdate(user._id, { $set: { otp: null }, }).select('-password -otp -refreshToken').populate({ path: "organization", model: Company }).populate({ path: "workReports", model: WorkReport }).populate({ path: "projects", model: Project }).populate({ path: "tasks", model: Task }).populate({ path: "teams", model: Team }).populate({ path: "attendance", model: Attendance }).populate({ path: "leaves", model: Leave }).populate({ path: "manager", model: User, select: "-password -otp -refreshToken", options: { strictPopulate: false } }).populate({ path: "managed_teams", model: Team, options: { strictPopulate: false } })

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
        if (error instanceof Error) {
            console.error(`Error while verifying OTP: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}