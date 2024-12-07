import bcryptjs from "bcryptjs";
import transporter from "../config/nodemailer.config";
import SuperAdmin from "../models/superAdmin.model";
import User from "../models/user.model";

function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export const sendOTPVerification = async (id: string, email: string, role: string) => {
    try {
        const otp = generateOTP();

        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: "Verify Your Email",
            html: `
                <p>Enter <b>${otp}</b> in the app to verify your email address and complete signup.</p>
                <p>This code <b>expires in 1 hour</b>.</p>
            `,
        };

        const saltRounds = 12;
        const hashedOTP = await bcryptjs.hash(otp, saltRounds);

        if (role === "admin") {
            const result = await SuperAdmin.findOneAndUpdate(
                { _id: id },
                { $set: { otp: hashedOTP } },
                { new: true }
            );

            if (!result) {
                throw new Error("User not found.");
            }
        } else if (role === "user") {
            const result = await User.findOneAndUpdate(
                { _id: id },
                { $set: { otp: hashedOTP } },
                { new: true }
            );

            if (!result) {
                throw new Error("User not found.");
            }
        } else {
            throw new Error("Invalid role provided.");
        }

        await transporter.sendMail(mailOptions);

        return { success: true, message: "OTP is sent to your email.", email };
    } catch (error) {
        throw new Error(
            error instanceof Error ? error.message : "An unknown error occurred."
        );
    }
};
