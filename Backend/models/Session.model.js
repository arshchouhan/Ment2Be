import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "completed"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", SessionSchema);
