import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();

    const authResult = await authMiddleware(request);
    if (authResult.error) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      );
    }

    const { id: superAdminId, role: userRole, status } = authResult;

    if (status === 200 && (userRole === undefined || (userRole !== "admin" && userRole !== "manager"))) {
      return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });
    }

    const { firstName, lastName, email, avatar } = await request.json();

    const superAdmin = await SuperAdmin.findById(superAdminId);

    if (!superAdmin) {
      return NextResponse.json(
        { message: "SuperAdmin not found", success: false },
        { status: 404 }
      );
    }

    const updatedFields: Partial<typeof superAdmin> = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(avatar && { avatar }),
    };

    const updatedSuperAdmin = await SuperAdmin.findByIdAndUpdate(
      superAdminId,
      { $set: updatedFields },
      { new: true }
    ).select("-password -refreshToken -otp").populate({ path: "organization", model: 'Company', populate: [{ path: "users", model: "User" }, { path: "teams", model: "Team" }, { path: "projects", model: "Project" }, { path: "tasks", model: "Task" }] });

    return NextResponse.json(
      {
        message: "SuperAdmin updated successfully",
        success: true,
        data: updatedSuperAdmin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error while updating SuperAdmin: ${error instanceof Error ? error.message : error
      }`
    );
    return NextResponse.json(
      { message: "Internal server error.", success: false },
      { status: 500 }
    );
  }
}
