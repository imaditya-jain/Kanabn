import mongoose, { Document, Schema, Types, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface ISuperAdmin extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
    password: string;
    organization: mongoose.Schema.Types.ObjectId | null;
    otp: string | null;
    refreshToken: string | null;
    isVerified: boolean;
    comparePassword(enteredPassword: string): Promise<boolean>;
    compareOTP(enteredOTP: string): Promise<boolean>;
    getAccessToken(): string;
    getRefreshToken(): string;
}

const superAdminSchema = new Schema<ISuperAdmin>({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: {
            validator: (value: string) => validator.isEmail(value),
            message: "Invalid email address",
        },
    },
    avatar: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        validate: {
            validator: (value: string) =>
                validator.isStrongPassword(value, {
                    minLength: 8,
                    minLowercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                    minUppercase: 1,
                }),
            message:
                "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols.",
        },
    },
    organization: {
        type: mongoose.Types.ObjectId,
        ref: "Company",
        default: null,
    },
    otp: {
        type: String,
        default: null,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
});

superAdminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

superAdminSchema.methods.comparePassword = async function (
    enteredPassword: string
): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};

superAdminSchema.methods.compareOTP = async function (
    enteredOTP: string
): Promise<boolean> {
    return bcrypt.compare(enteredOTP, this.otp || "");
};

superAdminSchema.methods.getAccessToken = function (): string {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";

    if (!secret) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }

    return jwt.sign(
        {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            role: 'admin'
        },
        secret,
        { expiresIn: expiry }
    );
};

superAdminSchema.methods.getRefreshToken = function (): string {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";

    if (!secret) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }

    return jwt.sign({ _id: this._id, role: 'admin' }, secret, { expiresIn: expiry });
};

const SuperAdmin: Model<ISuperAdmin> =
    mongoose.models.SuperAdmin ||
    mongoose.model<ISuperAdmin>("SuperAdmin", superAdminSchema);

export default SuperAdmin;
export type { ISuperAdmin };
