import mongoose, { Document, Schema, Types, Model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from "validator";

enum Role {
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

enum MaritalStatus {
  MARRIED = 'married',
  SINGLE = 'single',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
  OTHER = 'other',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
  password: string;
  previousExperience: {
    employer: string | null,
    designation: string | null,
    startDate: Date | null,
    endDate: Date | null,
    documents: {
      experienceLetter: string | null,
      relivingLetter: string | null,
      payslips: string[],
    }
  }
  currentExperience: {
    employer: string | null,
    designation: string | null,
    startDate: Date | null,
    documents: {
      offerLetter: string | null,
      confirmationLetter: string | null,
      payslips: string[],
    }
  },
  personalDetails: {
    dateOfBirth: Date,
    gender: string,
    maritalStatus: MaritalStatus,
    emergencyContact: {
      name: string | null,
      relationship: string | null,
      phone: string | null,
      email: string | null,
      address: {
        street: string | null,
        city: string | null,
        state: string | null,
        country: string | null,
        zip: string | null,
      }
    },
  },
  documents: {
    aadhaarCard: string | null,
    panCard: string | null,
    passport: string | null,
  },
  bankDetails: {
    accountHolderName: string | null,
    accountNumber: string | null,
    bankName: string | null,
    ifscCode: string | null,
  },
  organization: mongoose.Types.ObjectId | null,
  workReports: mongoose.Types.ObjectId[],
  projects: mongoose.Types.ObjectId[],
  tasks: mongoose.Types.ObjectId[],
  teams: mongoose.Types.ObjectId[],
  attendance: mongoose.Types.ObjectId[],
  leaves: mongoose.Types.ObjectId[],
  role: Role,
  manager: mongoose.Types.ObjectId | null,
  managed_teams: mongoose.Types.ObjectId[] | null,
  otp: string | null;
  refreshToken: string | null;
  comparePassword(enteredPassword: string): Promise<boolean>;
  compareOTP(enteredOTP: string): Promise<boolean>;
  getAccessToken(): string;
  getRefreshToken(): string;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: "Invalid email address",
    },
  },
  phone: { type: String, required: true, unique: true, trim: true },
  avatar: { type: String, default: null },
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
  previousExperience: {
    employer: { type: String, default: null },
    designation: { type: String, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    documents: {
      experienceLetter: { type: String, default: null },
      relivingLetter: { type: String, default: null },
      payslips: [{ type: String, default: null }],
    },
  },
  currentExperience: {
    employer: { type: String, default: null },
    designation: { type: String, default: null },
    startDate: { type: Date, default: null },
    documents: {
      offerLetter: { type: String, default: null },
      confirmationLetter: { type: String, default: null },
      payslips: [{ type: String, default: null }],
    }
  },
  personalDetails: {
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, default: null },
    maritalStatus: { type: String, enum: Object.values(MaritalStatus), default: MaritalStatus.SINGLE },
    emergencyContact: {
      name: { type: String, default: null },
      relationship: { type: String, default: null },
      phone: { type: String, default: null },
      email: { type: String, default: null },
      address: {
        street: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        zip: { type: String, default: null },
      }
    }
  },
  documents: {
    aadhaarCard: { type: String, default: null },
    panCard: { type: String, default: null },
    passport: { type: String, default: null },
  },
  bankDetails: {
    accountHolderName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    bankName: { type: String, default: null },
    ifscCode: { type: String, default: null },
  },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  workReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkReport', default: null }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }],
  attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance', default: null }],
  leaves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Leave', default: null }],
  role: { type: String, enum: Object.values(Role), default: Role.EMPLOYEE, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  managed_teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: [] }],
  otp: { type: String, default: null },
  refreshToken: { type: String, default: null },
});

userSchema.pre('save', function (next) {
  if (this.role === Role.MANAGER) {
    this.manager = null;
  }

  if (this.role === Role.EMPLOYEE) {
    this.managed_teams = null;
  } else if (this.role === Role.MANAGER) {
    if (!this.managed_teams) {
      this.managed_teams = [];
    }
  }

  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.compareOTP = async function (enteredOTP: string): Promise<boolean> {
  return bcrypt.compare(enteredOTP, this.otp);
};

userSchema.methods.getAccessToken = function (): string {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }
  return jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1d' }
  );
};

userSchema.methods.getRefreshToken = function (): string {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }
  return jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
