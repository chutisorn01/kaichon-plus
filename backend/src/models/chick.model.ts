import mongoose, { Document, Schema } from 'mongoose';

export interface IChick extends Document {
  user: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
  father: mongoose.Types.ObjectId;
  mother: mongoose.Types.ObjectId;
  fatherNameText?: string;
  motherNameText?: string;
  code: string;
  name: string;
  gender: 'ผู้' | 'เมีย' | 'ยังไม่ระบุ';
  bloodline?: string;
  color?: string;
  bandColor?: string;
  bandNumber?: string;
  bandText?: string;
  originFarm?: mongoose.Types.ObjectId;
  isApprovedByParent?: boolean;
  status: string;
  saleInfo?: {
    customerName?: string;
    customerPhone?: string;
    customerFarm?: string;
    saleDate?: Date;
    price?: number;
    notes?: string;
  };
  notes?: string;
  image?: string;
  hatchDate?: Date;
}

const chickSchema = new Schema<IChick>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'BreedingBatch', required: true },
    father: { type: Schema.Types.ObjectId, ref: 'Father', required: true },
    mother: { type: Schema.Types.ObjectId, ref: 'Mother', required: true },
    fatherNameText: { type: String, trim: true },
    motherNameText: { type: String, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    name: { type: String, default: 'ลูกไก่' },
    gender: { type: String, enum: ['ผู้', 'เมีย', 'ยังไม่ระบุ'], default: 'ยังไม่ระบุ' },
    bloodline: { type: String, trim: true },
    color: { type: String, trim: true },
    bandColor: { type: String, trim: true },
    bandNumber: { type: String, trim: true, index: true },
    bandText: { type: String, trim: true },
    originFarm: { type: Schema.Types.ObjectId, ref: 'User' },
    isApprovedByParent: { type: Boolean, default: true },
    status: { type: String, default: 'ปกติ' },
    image: { type: String },
    hatchDate: { type: Date },
    saleInfo: {
      customerName: String,
      customerPhone: String,
      customerFarm: String,
      saleDate: Date,
      price: Number,
      notes: String,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Chick = mongoose.model<IChick>('Chick', chickSchema);