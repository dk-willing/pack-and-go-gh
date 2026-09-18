import { Schema, model } from "mongoose";

interface SequenceDocument { _id: string; value: number }
const sequenceSchema = new Schema<SequenceDocument>({ _id: String, value: { type: Number, default: 0 } }, { versionKey: false });
export const Sequence = model<SequenceDocument>("Sequence", sequenceSchema);