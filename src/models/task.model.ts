import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITask extends Document {
    title: string;
}

const taskSchema = new Schema<ITask>({
    title: {
        type: String,
        required: true
    }
});

const Task: Model<ITask> = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
