import mongoose, { Document, Schema } from 'mongoose';

export interface IMother extends Document {
  user: mongoose.Types.ObjectId;
  code: string;
  name: string;
  breed: string;
  color: string;
  bandNumber?: string;
  bandColor?: string;
  fatherNameText?: string;
  motherNameText?: string;
  records?: string;
  hatchDate?: Date;
  status: string;
  image?: string;
}

const motherSchema = new Schema<IMother>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    breed: { type: String, required: true },
    color: { type: String, required: true },
    bandNumber: { type: String },
    bandColor: { type: String },
    fatherNameText: { type: String, trim: true },
    motherNameText: { type: String, trim: true },
    records: { type: String },
    hatchDate: { type: Date },
    status: { type: String, default: 'ปกติ' },
    image: { type: String }
  },
  { timestamps: true }
);

export const Mother = mongoose.model<IMother>('Mother', motherSchema);