/**
 * setup-admin.cjs (CommonJS Version)
 * Run using: node setup-admin.cjs
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1. Manually parse .env.local if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...values] = trimmed.split("=");
        if (key && values.length) {
          process.env[key.trim()] = values
            .join("=")
            .trim()
            .replace(/^["']|["']$/g, "");
        }
      }
    });
  }
}

loadEnv();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/radha_outfit";

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function configureMasterAdmin() {
  // Read credentials from .env.local or ask in terminal
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;

  if (!email) {
    email = await askQuestion("Enter Master Admin Email: ");
  }

  if (!password) {
    password = await askQuestion("Enter Master Admin Password: ");
  }

  if (!email || !password) {
    console.error("Error: Admin email and password cannot be empty.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Demote all other accounts to 'customer' to prevent unauthorized admin access
    const demoteResult = await db.collection("users").updateMany(
      { email: { $ne: normalizedEmail } },
      { $set: { role: "customer" } }
    );
    console.log(`Demoted ${demoteResult.modifiedCount} other account(s) to 'customer'.`);

    // 2. Upsert the Master Admin
    await db.collection("users").updateOne(
      { email: normalizedEmail },
      {
        $set: {
          name: "Master Administrator",
          email: normalizedEmail,
          password: hashedPassword,
          role: "admin",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("\n==================================================");
    console.log(" MASTER ADMIN CONFIGURED SUCCESSFULLY");
    console.log("==================================================");
    console.log(` Admin account: [${normalizedEmail}] is active with role 'admin'.`);
    console.log(" Password has been encrypted and saved to database.");
    console.log("==================================================\n");
  } catch (error) {
    console.error("Failed to configure admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

configureMasterAdmin();