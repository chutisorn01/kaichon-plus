import mongoose, { Document, Schema } from 'mongoose';

export interface IVipBreeding extends Document {
  user: mongoose.Types.ObjectId;
  queueNo: string;
  intakeDate: Date;
  father: mongoose.Types.ObjectId; // Referencing existing Father
  motherName: string; // Free text since mother is from outside
  bandNo: string;
  weight: number;
  phone: string;
  caretaker: string;

  // Breeding Details
  lockNo: string;
  cycleNo: number;
  breedingStartDate: Date;
  matingCount: number;

  // Incubation Details
  eggCount: number;
  incubationDate: Date;
  fertileEggs: number;

  // Hatching & Nursery Details
  hatchDate: Date;
  chickQuantity: number;
  vaccines: string;
  nurseryDate: Date;
  nurseryLockNo: string;
  nurseryCycleQty: string;

  // Delivery & Return Details
  expectedDeliveryDate: Date;
  deliveryLockNo: string;
  deliveryCycleQty: string;
  
  motherReturnDate: Date;
  motherReturnWeight: number;

  notes: string;
  isChicksGenerated: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const vipBreedingSchema = new Schema<IVipBreeding>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    queueNo: { type: String, required: true },
    intakeDate: { type: Date, required: true },
    father: { type: Schema.Types.ObjectId, ref: 'Father', required: true },
    motherName: { type: String, required: true },
    bandNo: { type: String },
    weight: { type: Number },
    phone: { type: String },
    caretaker: { type: String },

    lockNo: { type: String },
    cycleNo: { type: Number },
    breedingStartDate: { type: Date },
    matingCount: { type: Number },

    eggCount: { type: Number },
    incubationDate: { type: Date },
    fertileEggs: { type: Number },

    hatchDate: { type: Date },
    chickQuantity: { type: Number },
    vaccines: { type: String },
    nurseryDate: { type: Date },
    nurseryLockNo: { type: String },
    nurseryCycleQty: { type: String },

    expectedDeliveryDate: { type: Date },
    deliveryLockNo: { type: String },
    deliveryCycleQty: { type: String },
    
    motherReturnDate: { type: Date },
    motherReturnWeight: { type: Number },

    notes: { type: String },
    isChicksGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const VipBreeding = mongoose.model<IVipBreeding>('VipBreeding', vipBreedingSchema);
