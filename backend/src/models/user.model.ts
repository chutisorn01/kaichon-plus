import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  passwordHash: string;
  passwordSalt: string;
  name: string;
  role: string;
  farmName?: string;
  farmCode?: string;
  isVerified?: boolean;
  farmType?: 'main' | 'sub';
  parentFarm?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    passwordSalt: {
      type: String,
      required: [true, 'Password salt is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    farmName: {
      type: String,
      trim: true,
    },
    farmCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    farmType: {
      type: String,
      enum: ['main', 'sub'],
      default: 'main',
    },
    parentFarm: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    role: {
      type: String,
      required: true,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
