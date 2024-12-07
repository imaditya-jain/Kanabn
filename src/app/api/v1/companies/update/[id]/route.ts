import { NextResponse } from 'next/server';
import connectToDatabase from "@/src/config/db.config";
import Company from "@/src/models/company.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

        const { id } = (await params);
        if (!id) {
            return NextResponse.json({ message: "Missing or invalid ID", success: false }, { status: 400 });
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
            website
        } = await request.json();

        const company = await Company.findById(id);
        if (!company) {
            return NextResponse.json({ message: "Company not found", success: false }, { status: 404 });
        }

        const updatedFields: Partial<typeof company> = {
            ...(name && { name }),
            ...(industry && { industry }),
            ...(description && { description }),
            ...(logo && { logo }),
            ...(establishedDate && { establishedDate }),
        };

        if (street || city || state || country || zip) {
            updatedFields.address = {
                street: street || company.address.street,
                city: city || company.address.city,
                state: state || company.address.state,
                country: country || company.address.country,
                zip: zip || company.address.zip,
            };
        }

        if (phone || email || website) {
            updatedFields.contact = {
                phone: phone || company.contact.phone,
                email: email || company.contact.email,
                website: website || company.contact.website,
            };
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            company._id,
            { $set: updatedFields },
            { new: true }
        );

        return NextResponse.json({ message: "Company updated successfully", success: true, data: updatedCompany }, { status: 200 });
    } catch (error) {
        console.error(`Error while updating company: ${error instanceof Error ? error.message : error}`);
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 });
    }
}