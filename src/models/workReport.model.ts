import mongoose, { Document, Schema, Model } from "mongoose";

export interface IWorkReport extends Document {
  user: mongoose.Types.ObjectId;
}

const workReportSchema = new Schema<IWorkReport>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const WorkReport: Model<IWorkReport> =
  mongoose.models.WorkReport || mongoose.model("WorkReport", workReportSchema);

export default WorkReport;
