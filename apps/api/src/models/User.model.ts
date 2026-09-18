import { Schema, model, type HydratedDocument } from "mongoose";
import { UserRole } from "@pack-and-go/types";

export interface UserDocument {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER, required: true },
    isActive: { type: Boolean, default: true, required: true },
    emailVerified: { type: Boolean, default: false, required: true },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

export type UserDocumentHydrated = HydratedDocument<UserDocument>;
export const User = model<UserDocument>("User", userSchema);