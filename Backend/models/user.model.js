import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["mentor", "student"], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    bio: String,
    hourlyRate: Number,
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
