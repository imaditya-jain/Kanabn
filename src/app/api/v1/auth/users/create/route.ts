import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import User from "@/src/models/user.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";
import Company from "@/src/models/company.model";

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { organization: organizationId, role: userRole, status } = authResult;

        console.log(organizationId, userRole, status);

        if (status === 200 && (userRole === undefined || (userRole !== "admin" && userRole !== "manager"))) {
            return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });
        }

        if (request.method !== "POST") return NextResponse.json({ message: "Method is not allowed.", success: false }, { status: 405 })

        const { firstName, lastName, email, phone, password, role } = await request.json()

        if (!firstName || !lastName || !email || !phone || !password || !role) return NextResponse.json({ message: "All fields are required.", success: false }, { status: 400 })

        if (userRole === "manager" && role === "manager") return NextResponse.json({ message: "You are not authorized to perform this action.", success: false }, { status: 403 })

        const user = await User.findOne({ email })

        if (user) return NextResponse.json({ message: "User already exist.", success: false }, { status: 409 })

        const newUser = await User.create({ firstName, lastName, email, phone, password, role, organization: organizationId });

        const createdUser = await User.findById(newUser._id)

        if (!createdUser) return NextResponse.json({ message: "User not found.", success: false }, { status: 404 })

        await Company.findOneAndUpdate({ _id: organizationId }, { $push: { users: createdUser._id } })

        return NextResponse.json({ data: { user: createdUser }, success: true }, { status: 201 })

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while registering user: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 })
    }
}