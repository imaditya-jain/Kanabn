import mongoose, { Document, Schema, Model } from "mongoose";

export interface ILeaves extends Document {
    user: mongoose.Types.ObjectId;
}

const leavesSchema = new Schema<ILeaves>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const Leave: Model<ILeaves> = mongoose.models.Leave || mongoose.model("Leave", leavesSchema);

export default Leave;
