import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Skill", SkillSchema);
