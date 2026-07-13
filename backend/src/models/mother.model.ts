import mongoose, { Document, Schema } from 'mongoose';

export interface IMother extends Document {
  user: mongoose.Types.ObjectId;
  code: string;
  name: string;
  breed: string;
  color: string;
  bandNumber?: string;
  bandColor?: string;
  bandText?: string;
  fatherNameText?: string;
  motherNameText?: string;
  records?: string;
  hatchDate?: Date;
  status: string;
  saleInfo?: {
    customerName?: string;
    customerPhone?: string;
    customerFarm?: string;
    saleDate?: Date;
    price?: number;
    notes?: string;
  };
  image?: string;
  completedVaccines?: {
    vaccineName: string;
    date: Date;
  }[];
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
    bandText: { type: String, trim: true },
    fatherNameText: { type: String, trim: true },
    motherNameText: { type: String, trim: true },
    records: { type: String },
    hatchDate: { type: Date },
    status: { type: String, default: 'ปกติ' },
    saleInfo: {
      customerName: String,
      customerPhone: String,
      customerFarm: String,
      saleDate: Date,
      price: Number,
      notes: String,
    },
    image: { type: String },
    completedVaccines: [{
      vaccineName: { type: String, required: true },
      date: { type: Date, required: true }
    }]
  },
  { timestamps: true }
);

export const Mother = mongoose.model<IMother>('Mother', motherSchema);