import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import SuperAdmin, { ISuperAdmin } from "@/src/models/superAdmin.model";
import User, { IUser } from "@/src/models/user.model";

export async function authMiddleware(request: Request) {
    try {
        const cookies = request.headers.get("cookie");
        const token = cookies
            ? cookies.split("; ").find((cookie) => cookie.startsWith("accessToken="))?.split("=")[1]
            : null;

        const authHeader = request.headers.get("authorization");
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        const accessToken = token || bearerToken;

        if (!accessToken) {
            return { error: "Access token is missing.", status: 401 };
        }

        const secretKey = process.env.ACCESS_TOKEN_SECRET || "";
        let decodedToken: { _id: string; role: string } | null = null;

        try {
            decodedToken = jwt.verify(accessToken, secretKey) as { _id: string; role: string };
        } catch {
            return { error: "Invalid or expired token.", status: 401 };
        }

        if (!decodedToken || !mongoose.isValidObjectId(decodedToken._id)) {
            return { error: "Invalid token payload.", status: 401 };
        }

        let user: ISuperAdmin | IUser | null = null;

        if (decodedToken.role === "admin") {
            user = await SuperAdmin.findById(decodedToken._id).select("-password -refreshToken -otp");
        } else if (decodedToken.role === "employee" || decodedToken.role === "manager") {
            user = await User.findById(decodedToken._id).select("-password -refreshToken -otp");
        }

        if (!user) {
            return { error: "Invalid access token.", status: 401 };
        }

        if ("email" in user && "_id" in user && "organization" in user) {
            if (user.organization) {
                return {
                    id: user._id.toString(),
                    organization: user.organization.toString(),
                    email: user.email,
                    role: decodedToken.role,
                    status: 200,
                };
            }
        }

        return { error: "Unexpected user type.", status: 500 };
    } catch (error) {
        if (error instanceof Error) {
            console.error("Middleware error:", error.message);
        } else {
            console.error("An unknown error occurred.");
        }
        return { error: "An error occurred during authentication.", status: 500 };
    }
}
