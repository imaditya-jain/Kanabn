import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";
import Company from "@/src/models/company.model"; // Ensure you have the Company model imported
import { authMiddleware } from "@/src/middleware/auth.middleware";
import { NextResponse } from "next/server";

export async function DELETE(
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

    if (status === 200 && role !== "admin") {
      return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });
    }

    if (request.method !== "DELETE")
      return NextResponse.json(
        { method: "Method not allowed", success: false },
        { status: 405 }
      );

    const { id } = context.params;

    const superAdmin = await SuperAdmin.findById(id);
    if (!superAdmin) {
      return NextResponse.json(
        { message: "Super admin not found.", success: false },
        { status: 404 }
      );
    }

    await Company.deleteMany({ _id: { $in: superAdmin.companies } });

    const response = await SuperAdmin.findByIdAndDelete(id);

    if (!response) {
      return NextResponse.json(
        { message: "Super admin not found.", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Super admin and related companies deleted successfully.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error while deleting super admin: ${error instanceof Error ? error.message : error
      }`
    );
    return NextResponse.json(
      { message: "Internal server error.", success: false },
      { status: 500 }
    );
  }
}
