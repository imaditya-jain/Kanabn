import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import Company from "@/src/models/company.model";
import SuperAdmin from "@/src/models/superAdmin.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function POST(request: Request) {
    try {
        await connectToDatabase();

        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { id, role, status } = authResult;

        if (status === 200 && role !== "admin") {
            return NextResponse.json({ message: "You are not authorized to perform this action." }, { status: 403 });
        }


        const requestData = await request.json();

        const requiredFields = [
            "name", "industry", "logo", "street", "city", "state",
            "country", "zip", "phone", "email", "website"
        ];

        const hasAllFields = requiredFields.every((field) => requestData[field]);
        if (!hasAllFields) {
            return NextResponse.json({ message: "All fields are required." }, { status: 400 });
        }

        const {
            name,
            industry,
            description,
            logo,
            establishedDate,
            street,
            city,
            state,
            country,
            zip,
            phone,
            email,
            website,
        } = requestData;

        const companyCount = await Company.countDocuments({});
        if (companyCount >= 1) {
            return NextResponse.json(
                { message: "You can create only 1 company.", success: false },
                { status: 403 }
            );
        }

        const existingCompany = await Company.findOne({ $or: [{ email }, { name }] });
        if (existingCompany) {
            return NextResponse.json(
                { message: "A company with the same email or name already exists.", success: false },
                { status: 409 }
            );
        }

        const newCompany = await Company.create({
            name,
            industry,
            description,
            logo,
            establishedDate,
            address: { street, city, state, country, zip },
            contact: { phone, email, website },
            createdBy: id
        });

        const createdCompany = await Company.findById(newCompany._id);

        if (!createdCompany) {
            return NextResponse.json({ message: "Company not found." }, { status: 404 });
        }

        const superAdmin = await SuperAdmin.findById(id);
        if (!superAdmin) {
            return NextResponse.json({ message: "Super admin not found." }, { status: 404 });
        }

        superAdmin.organization = createdCompany._id;
        await superAdmin.save();

        return NextResponse.json(
            {
                message: "Company created successfully.",
                data: {
                    company: newCompany,
                },
                success: true,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "Error while creating company:",
            error instanceof Error ? error.message : "Unknown error"
        );
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
}
