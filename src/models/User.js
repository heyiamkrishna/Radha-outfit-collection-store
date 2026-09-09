import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters."],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer", // Locked down: Never defaults to admin
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    addresses: [
      {
        fullName: { type: String, trim: true },
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true, default: "Delhi" },
        postalCode: { type: String, trim: true },
        phone: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent overwriting model once compiled in Next.js hot reload
export default mongoose.models.User || mongoose.model("User", UserSchema);