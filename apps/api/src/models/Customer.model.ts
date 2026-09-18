import { Schema, model, type HydratedDocument } from "mongoose";

export interface SavedLocation {
  _id: Schema.Types.ObjectId;
  label: string;
  country: string;
  region: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface CustomerDocument {
  user: Schema.Types.ObjectId;
  phone?: string;
  alternatePhone?: string;
  companyName?: string;
  savedLocations: SavedLocation[];
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<SavedLocation>({
  label: { type: String, required: true, trim: true, maxlength: 50 },
  country: { type: String, required: true, trim: true, maxlength: 80 },
  region: { type: String, required: true, trim: true, maxlength: 80 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  address: { type: String, required: true, trim: true, maxlength: 250 },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  instructions: { type: String, trim: true, maxlength: 500 },
  contactName: { type: String, trim: true, maxlength: 100 },
  contactPhone: { type: String, trim: true, maxlength: 30 },
});

const customerSchema = new Schema<CustomerDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    phone: { type: String, trim: true, maxlength: 30 },
    alternatePhone: { type: String, trim: true, maxlength: 30 },
    companyName: { type: String, trim: true, maxlength: 150 },
    savedLocations: { type: [locationSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export type CustomerDocumentHydrated = HydratedDocument<CustomerDocument>;
export const Customer = model<CustomerDocument>("Customer", customerSchema);