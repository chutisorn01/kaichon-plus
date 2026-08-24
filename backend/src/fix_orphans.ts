import mongoose from 'mongoose';
import { Chicken } from './models/chicken.model.js';
import { Father } from './models/father.model.js';
import { Mother } from './models/mother.model.js';
import { Chick } from './models/chick.model.js';
import { User } from './models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kaichon-plus');
  const admin = await User.findOne({ username: 'adminkaichon' });
  if (admin) {
    const adminId = admin._id;
    console.log('Found admin ID:', adminId);
    
    // Set some contact info for admin so it shows up on the frontend
    if (!admin.phone) admin.phone = '0812345678';
    if (!admin.facebook) admin.facebook = 'Kaichon Plus Admin';
    await admin.save();
    console.log('Updated admin contact info');

    const updateRes1 = await Chicken.updateMany({}, { $set: { user: adminId } });
    console.log('Chickens updated:', updateRes1.modifiedCount);
    
    const updateRes2 = await Father.updateMany({}, { $set: { user: adminId } });
    console.log('Fathers updated:', updateRes2.modifiedCount);
    
    const updateRes3 = await Mother.updateMany({}, { $set: { user: adminId } });
    console.log('Mothers updated:', updateRes3.modifiedCount);
    
    const updateRes4 = await Chick.updateMany({}, { $set: { user: adminId } });
    console.log('Chicks updated:', updateRes4.modifiedCount);
  } else {
    console.log('Admin not found!');
  }
  await mongoose.disconnect();
}
run();
