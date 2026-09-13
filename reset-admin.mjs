import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Read MONGODB_URI from .env.local if not already in process.env
let mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
    if (match) mongoUri = match[1];
  } catch (e) {
    // ignore
  }
}

if (!mongoUri) {
  console.error("❌ MONGODB_URI not found. Please set it in .env.local or paste it into this script.");
  process.exit(1);
}

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    const usersCollection = mongoose.connection.collection("users");

    // Check existing admins
    const existingAdmin = await usersCollection.findOne({
      role: { $in: ["admin", "superadmin"] },
    });

    const targetEmail = existingAdmin?.email || "admin@radhaoutfit.com";
    const newPlainPassword = "AdminPassword@2026";
    const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

    const result = await usersCollection.updateOne(
      { email: targetEmail },
      {
        $set: {
          email: targetEmail,
          password: hashedPassword,
          role: "admin",
          name: existingAdmin?.name || "Atelier Admin",
        },
      },
      { upsert: true }
    );

    console.log("\n==========================================");
    console.log("🎉 ADMIN CREDENTIALS SET SUCCESSFULLY");
    console.log("==========================================");
    console.log(`Email:    ${targetEmail}`);
    console.log(`Password: ${newPlainPassword}`);
    console.log(`Role:     admin`);
    console.log("==========================================\n");
  } catch (err) {
    console.error("❌ Error resetting admin:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();