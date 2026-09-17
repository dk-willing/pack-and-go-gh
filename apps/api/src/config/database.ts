import mongoose from "mongoose";
import { env } from "./env";

mongoose.set("strictQuery", true);

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`✅ MongoDB connected (${mongoose.connection.name})`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    // In the foundation stage we fail fast so misconfiguration is caught
    // immediately rather than surfacing later as confusing runtime errors.
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
  });

  mongoose.connection.on("error", (error) => {
    console.error("❌ MongoDB connection error:", error);
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
