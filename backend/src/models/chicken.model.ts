import mongoose, { Document, Schema } from 'mongoose';

export interface IChicken extends Document {
  code: string;
  name: string;
  gender: 'male' | 'female';
  bloodline: string;
  father: mongoose.Types.ObjectId | null;
  mother: mongoose.Types.ObjectId | null;
  fatherNameText?: string;
  motherNameText?: string;
  user?: mongoose.Types.ObjectId;
  originFarm?: mongoose.Types.ObjectId;
  bandNumber?: string;
  bandColor?: string;
  bandText?: string;
  isApprovedByParent?: boolean;
  image?: string;
  hatchDate?: Date;
  status?: string;
  saleInfo?: {
    customerName?: string;
    customerPhone?: string;
    customerFarm?: string;
    saleDate?: Date;
    price?: number;
    notes?: string;
  };
  notes?: string;
  completedVaccines?: {
    vaccineName: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const chickenSchema = new Schema<IChicken>(
  {
    code: {
      type: String,
      required: [true, 'Chicken code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Chicken name is required'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female'],
        message: '{VALUE} is not a valid gender (male or female)',
      },
    },
    bloodline: {
      type: String,
      required: [true, 'Bloodline description is required'],
      trim: true,
    },
    father: {
      type: Schema.Types.ObjectId,
      ref: 'Chicken',
      default: null,
    },
    mother: {
      type: Schema.Types.ObjectId,
      ref: 'Chicken',
      default: null,
    },
    fatherNameText: {
      type: String,
      trim: true,
    },
    motherNameText: {
      type: String,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    originFarm: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    bandNumber: {
      type: String,
      trim: true,
      index: true,
    },
    bandColor: {
      type: String,
      trim: true,
    },
    bandText: {
      type: String,
      trim: true,
    },
    isApprovedByParent: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
    hatchDate: {
      type: Date,
    },
    status: {
      type: String,
      default: 'ปกติ',
    },
    notes: {
      type: String,
    },
    saleInfo: {
      customerName: String,
      customerPhone: String,
      customerFarm: String,
      saleDate: Date,
      price: Number,
      notes: String,
    },
    completedVaccines: [{
      vaccineName: { type: String, required: true },
      date: { type: Date, required: true }
    }]
  },
  {
    timestamps: true,
  }
);

export const Chicken = mongoose.model<IChicken>('Chicken', chickenSchema);
