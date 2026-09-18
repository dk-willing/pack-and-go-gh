import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/database";
import { User } from "../models/User.model";
import { UserRole } from "@pack-and-go/types";

async function createAdmin() {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running create:admin");
  }
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, password: passwordHash, role: UserRole.ADMIN, isActive: true } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  );

  console.log(`Admin account ready: ${user.email}`);
  await disconnectDatabase();
}

createAdmin().catch(async (error) => {
  console.error("Unable to create admin account:", error instanceof Error ? error.message : error);
  await disconnectDatabase().catch(() => undefined);
  process.exitCode = 1;
});