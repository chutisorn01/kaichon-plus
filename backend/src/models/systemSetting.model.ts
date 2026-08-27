import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },
  adminLineUrl: {
    type: String,
    default: 'https://line.me/ti/p/~your_line_id'
  }
}, {
  timestamps: true
});

// Create a static method to always get the single config document
systemSettingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ isRegistrationOpen: true });
  }
  return settings;
};

export const SystemSetting = mongoose.model<any, any>('SystemSetting', systemSettingSchema);
