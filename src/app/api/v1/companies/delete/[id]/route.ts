import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import Company from "@/src/models/company.model";
import SuperAdmin from "@/src/models/superAdmin.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

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

    const { id: userId, role, status } = authResult;

    if (status === 200 && role !== "admin") {
      return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });
    }


    if (request.method !== "DELETE")
      return NextResponse.json(
        { method: "Method not allowed", success: false },
        { status: 405 }
      );

    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { message: "Missing or invalid ID", success: false },
        { status: 400 }
      );
    }

    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { message: "Company not found", success: false },
        { status: 404 }
      );
    }

    const response = await Company.deleteOne({ _id: id });
    if (response.deletedCount === 1) {
      await SuperAdmin.findOneAndUpdate(
        { _id: userId },
        { $pull: { companies: id } }
      );
      return NextResponse.json(
        { message: "Company deleted successfully", success: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Company not found", success: false },
        { status: 404 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error while deleting companies: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
