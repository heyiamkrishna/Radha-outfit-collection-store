import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner headline title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "New Arrival",
      trim: true,
    },
    tagline: {
      type: String,
      default: "",
      trim: true,
    },
    ctaText: {
      type: String,
      default: "Shop Collection",
      trim: true,
    },
    ctaLink: {
      type: String,
      default: "/shop",
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Banner image URL is required"],
    },
    mobileImage: {
      type: String,
      default: "",
    },
    bgGradient: {
      type: String,
      default: "from-[#F7F4EF] via-[#F4F5F9] to-[#E9EDF5]",
    },
    textColor: {
      type: String,
      default: "#0C0D11",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model("Banner", BannerSchema);