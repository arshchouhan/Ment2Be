import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["mentor", "student"], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    bio: { type: String, required: false },
    hourlyRate: { type: Number, required: false },
    skills: [{ type: String }],
    interests: [{ type: String }],
    goals: { type: String, default: '' },
    socialLinks: {
      linkedIn: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' }
    },
    profilePicture: { type: String, default: '' },
    isProfileComplete: { type: Boolean, default: false },
    karmaPoints: { type: Number, default: 0 }
  },
  { timestamps: true }
);


UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};


const User = mongoose.model("User", UserSchema);

export default User;