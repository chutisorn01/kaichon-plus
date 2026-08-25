import mongoose, { Document, Schema } from 'mongoose';

export interface IVipSubscription extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  slipImage: string; // base64 or URL
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const vipSubscriptionSchema = new Schema<IVipSubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export const VipSubscription = mongoose.model<IVipSubscription>('VipSubscription', vipSubscriptionSchema);
