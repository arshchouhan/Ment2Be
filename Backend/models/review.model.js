import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: String,
  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);
