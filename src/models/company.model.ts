import mongoose, { Document, Schema } from "mongoose";
import validator from 'validator';

enum IndustryType {
    TECHNOLOGY = 'Technology',
    FINANCE = 'Finance',
    HEALTHCARE = 'Healthcare',
    EDUCATION = 'Education',
    OTHER = 'Other',
}

interface ICompany extends Document {
    name: string;
    industry: IndustryType;
    description: string;
    logo: string;
    establishedDate: Date
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    },
    contact: {
        phone: string;
        email: string;
        website: string;
    },
    users: mongoose.Types.ObjectId[];
    teams: mongoose.Types.ObjectId[];
    projects: mongoose.Types.ObjectId[];
    tasks: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId | null;
}

const companySchema = new Schema<ICompany>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    industry: {
        type: String,
        enum: Object.values(IndustryType),
        required: true,
    },
    description: {
        type: String,
    },
    logo: {
        type: String,
        required: true,
    },
    establishedDate: {
        type: Date,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        zip: {
            type: String,
            required: true,
        },
    },
    contact: {
        phone: {
            type: String,
            required: true,
            validate: {
                validator: (value: string) => validator.isMobilePhone(value, 'any', { strictMode: true }),
                message: 'Invalid phone number'
            }
        },
        email: {
            type: String,
            required: true,
            validate: {
                validator: (value: string) => validator.isEmail(value),
                message: 'Invalid email'
            },
            unique: true
        },
        website: {
            type: String,
            required: true,
            validate: {
                validator: (value: string) => validator.isURL(value),
                message: 'Invalid website'
            }
        }
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    ],
    teams: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null
        }
    ],
    projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null
        }
    ],
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            default: null
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperAdmin',
        required: true
    }
}, { timestamps: true });

const Company = mongoose.models.Company || mongoose.model<ICompany>('Company', companySchema);

export default Company