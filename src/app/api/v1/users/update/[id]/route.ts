import { NextResponse } from "next/server";
import connectToDatabase from "@/src/config/db.config";
import User from "@/src/models/user.model";
import { authMiddleware } from "@/src/middleware/auth.middleware";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();

        const authResult = await authMiddleware(request);
        if (authResult.error) {
            return NextResponse.json({ message: authResult.error }, { status: authResult.status });
        }

        const { status: authStatus } = authResult;

        if (authStatus !== 200) {
            return NextResponse.json({ message: "You are not authorized to perform this action.", success: false }, { status: 403 });
        }

        const { id } = (await params);

        if (request.method !== "PATCH") {
            return NextResponse.json({ message: "Method not allowed", success: false }, { status: 405 });
        }

        const requestBody = await request.json();

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ message: "User not found.", success: false }, { status: 404 });
        }

        const {
            firstName,
            lastName,
            email,
            phone,
            avatar,
            password,
            prevEmployer,
            prevDesignation,
            prevStartDate,
            prevEndDate,
            prevExperienceLetter,
            prevRelivingLetter,
            prevPayslips,
            currentEmployer,
            currentDesignation,
            currentStartDate,
            currentOfferLetter,
            currentConfirmationLetter,
            currentPayslips,
            dateOfBirth,
            gender,
            maritalStatus,
            guardianName,
            guardianPhone,
            guardianRelation,
            guardianEmail,
            guardianStreetAddress,
            guardianCity,
            guardianState,
            guardianCountry,
            guardianPostalCode,
            aadhaarCard,
            panCard,
            passport,
            accountHolderName,
            accountNumber,
            bankName,
            ifscCode,
            role,
        } = requestBody;

        const updatedFields: Partial<typeof user> = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
            ...(phone && { phone }),
            ...(avatar && { avatar }),
            ...(password && { password }),
            ...(prevEmployer && { "previousExperience.employer": prevEmployer }),
            ...(prevDesignation && { "previousExperience.designation": prevDesignation }),
            ...(prevStartDate && { "previousExperience.startDate": new Date(prevStartDate) }),
            ...(prevEndDate && { "previousExperience.endDate": new Date(prevEndDate) }),
            ...(prevExperienceLetter && { "previousExperience.documents.experienceLetter": prevExperienceLetter }),
            ...(prevRelivingLetter && { "previousExperience.documents.relivingLetter": prevRelivingLetter }),
            ...(prevPayslips && { "previousExperience.documents.payslips": prevPayslips }),
            ...(currentEmployer && { "currentExperience.employer": currentEmployer }),
            ...(currentDesignation && { "currentExperience.designation": currentDesignation }),
            ...(currentStartDate && { "currentExperience.startDate": new Date(currentStartDate) }),
            ...(currentOfferLetter && { "currentExperience.documents.offerLetter": currentOfferLetter }),
            ...(currentConfirmationLetter && { "currentExperience.documents.confirmationLetter": currentConfirmationLetter }),
            ...(currentPayslips && { "currentExperience.documents.payslips": currentPayslips }),
            ...(dateOfBirth && { "personalDetails.dateOfBirth": new Date(dateOfBirth) }),
            ...(gender && { "personalDetails.gender": gender }),
            ...(maritalStatus && { "personalDetails.maritalStatus": maritalStatus }),
            ...(guardianName && { "personalDetails.emergencyContact.name": guardianName }),
            ...(guardianPhone && { "personalDetails.emergencyContact.phone": guardianPhone }),
            ...(guardianRelation && { "personalDetails.emergencyContact.relationship": guardianRelation }),
            ...(guardianEmail && { "personalDetails.emergencyContact.email": guardianEmail }),
            ...(guardianStreetAddress && { "personalDetails.emergencyContact.address.street": guardianStreetAddress }),
            ...(guardianCity && { "personalDetails.emergencyContact.address.city": guardianCity }),
            ...(guardianState && { "personalDetails.emergencyContact.address.state": guardianState }),
            ...(guardianCountry && { "personalDetails.emergencyContact.address.country": guardianCountry }),
            ...(guardianPostalCode && { "personalDetails.emergencyContact.address.zip": guardianPostalCode }),
            ...(aadhaarCard && { "documents.aadhaarCard": aadhaarCard }),
            ...(panCard && { "documents.panCard": panCard }),
            ...(passport && { "documents.passport": passport }),
            ...(accountHolderName && { "bankDetails.accountHolderName": accountHolderName }),
            ...(accountNumber && { "bankDetails.accountNumber": accountNumber }),
            ...(bankName && { "bankDetails.bankName": bankName }),
            ...(ifscCode && { "bankDetails.ifscCode": ifscCode }),
            ...(role && { role }),
        };

        Object.assign(user, updatedFields);

        await user.save();

        return NextResponse.json({ message: "User updated successfully.", success: true, user }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error while updating user: ${error.message}`);
        } else {
            console.error(`Error while updating user: ${error}`);
        }
        return NextResponse.json({ message: "Internal server error.", success: false }, { status: 500 });
    }
}
