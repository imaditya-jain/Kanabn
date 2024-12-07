import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProject extends Document {
  name: string;
}

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
  },
});

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
