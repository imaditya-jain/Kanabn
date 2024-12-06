import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";
import Company from "@/src/models/company.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";
import { NextResponse } from "next/server";
import User from "@/src/models/user.model";
import Team from "@/src/models/team.model";
import Project from "@/src/models/project.model";
import Task from "@/src/models/task.model";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const { role, status } = authResult;

    if (status === 200 && role !== "admin") return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });


    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Missing or invalid ID", success: false },
        { status: 400 }
      );
    }

    const superAdmin = await SuperAdmin.findById(id)
      .select("-password -refreshToken -otp")
      .populate({ path: "organization", model: Company, populate: [{ path: "users", model: User }, { path: "teams", model: Team }, { path: "projects", model: Project }, { path: "tasks", model: Task }] });

    if (!superAdmin) {
      return NextResponse.json(
        { message: "Super admin not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { superAdmin } }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error while getting super admins: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
