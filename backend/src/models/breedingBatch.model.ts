import mongoose, { Document, Schema } from 'mongoose';

export interface IBreedingBatch extends Document {
  user: mongoose.Types.ObjectId;
  batchCode: string;
  father: mongoose.Types.ObjectId;
  mother: mongoose.Types.ObjectId;
  breedingDate: Date;
  notes: string;
}

const breedingBatchSchema = new Schema<IBreedingBatch>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    batchCode: { type: String, required: true, unique: true, uppercase: true },
    father: { type: Schema.Types.ObjectId, ref: 'Father', required: true },
    mother: { type: Schema.Types.ObjectId, ref: 'Mother', required: true },
    breedingDate: { type: Date, default: Date.now },
    notes: { type: String }
  },
  { timestamps: true }
);

export const BreedingBatch = mongoose.model<IBreedingBatch>('BreedingBatch', breedingBatchSchema);
