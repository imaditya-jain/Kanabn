import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAttendance extends Document {
  user: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance