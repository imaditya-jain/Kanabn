import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITeam extends Document {
    name: string;
    teamLeader: mongoose.Types.ObjectId[],
    employees: mongoose.Types.ObjectId[],
    description: string | null,
    assignedProjects: mongoose.Types.ObjectId[],
}

const teamSchema = new Schema<ITeam>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    teamLeader: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    assignedProjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        }
    ]
}, { timestamps: true });

const Team: Model<ITeam> = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default Team;
