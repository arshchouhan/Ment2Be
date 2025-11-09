import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    amount: { type: Number, required: true },
    providerTxnId: { type: String, unique: true },
    status: {
      type: String,
      enum: ["initiated", "success", "failed"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
