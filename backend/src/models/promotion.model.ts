import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  user: mongoose.Types.ObjectId;
  father: mongoose.Types.ObjectId;
  durationDays: number;
  amount: number;
  slipImage: string; // base64 string
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotion>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    father: { type: Schema.Types.ObjectId, ref: 'Father', required: true },
    durationDays: { type: Number, required: true },
    amount: { type: Number, required: true },
    slipImage: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema);
