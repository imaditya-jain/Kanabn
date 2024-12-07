import { NextResponse } from 'next/server'
import connectToDatabase from "@/src/config/db.config";
import Company from "@/src/models/company.model";
import User from '@/src/models/user.model';
import { authMiddleware } from "@/src/middleware/auth.middleware";
import Team from '@/src/models/team.model';
import Project from '@/src/models/project.model';
import Task from '@/src/models/task.model';
import SuperAdmin from '@/src/models/superAdmin.model';

export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { role, status } = authResult;

        if (status === 200 && role !== "admin") {
            return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });
        }


        if (request.method !== 'GET') return NextResponse.json({ method: 'Method not allowed', success: false }, { status: 405 })

        const companies = await Company.find().populate({ path: 'users', model: User, select: '-password -otp -refreshToken' }).populate({ path: "teams", model: Team }).populate({ path: "projects", model: Project }).populate({ path: "tasks", model: Task }).populate({ path: "createdBy", model: SuperAdmin, select: '-password -otp -refreshToken' });

        if (!companies) return NextResponse.json({ message: "Please create a company first." }, { status: 200 })

        return NextResponse.json({ data: { companies }, }, { status: 200 })


    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while getting companies: ${error.message}`);
        } else {
            console.error('An unknown error occurred.');
        }
        return NextResponse.json({ message: "Internal server error." }, { status: 500 })
    }
}