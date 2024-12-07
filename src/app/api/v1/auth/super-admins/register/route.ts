import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import SuperAdmin from "@/src/models/superAdmin.model";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    if (request.method !== "POST")
      return NextResponse.json(
        { method: "Method not allowed", success: false },
        { status: 405 }
      );

    const { firstName, lastName, email, password, avatar } =
      await request.json();

    if (!firstName || !lastName || !email || !password)
      return NextResponse.json(
        { message: "All fields are required", success: false },
        { status: 400 }
      );

    const superAdminCount = await SuperAdmin.find().countDocuments();

    if (superAdminCount >= 2)
      return NextResponse.json(
        { message: "Only 2 super admin are allowed.", success: false },
        { status: 403 }
      );

    const isExist = await SuperAdmin.findOne({ email });

    if (isExist)
      return NextResponse.json(
        { message: "User already exist.", success: false },
        { status: 409 }
      );

    const newSuperAdmin = await SuperAdmin.create({
      firstName,
      lastName,
      email,
      password,
      avatar,
    });

    if (!newSuperAdmin)
      return NextResponse.json(
        { message: "Something went wrong.", success: false },
        { status: 500 }
      );

    const createdUser = await SuperAdmin.findById(newSuperAdmin._id).select(
      "-password -refreshToken -otp"
    );

    return NextResponse.json(
      { message: "Super admin is created.", data: createdUser, success: true },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error while registering super admin: ${error.message}`);
    } else {
      console.error("An unknown error occurred.");
    }
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
