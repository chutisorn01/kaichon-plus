import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { hashPassword } from './crypto.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaichon-plus';
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB for seeding...');

    const adminExists = await User.findOne({ username: 'adminkaichon' });
    if (!adminExists) {
      const password = 'kaichon168';
      const { salt, hash } = hashPassword(password);
      
      await User.create({
        username: 'adminkaichon',
        email: 'admin@kaichonplus.com',
        name: 'ผู้ดูแลระบบสูงสุด',
        passwordHash: hash,
        passwordSalt: salt,
        role: 'admin',
        isVerified: true,
        farmName: 'ฟาร์มส่วนกลาง (แอดมิน)',
        farmCode: 'ADMIN-MAIN'
      });
      
      console.log('--------------------------------------------------');
      console.log('🤖 ADMIN ACCOUNT AUTO-SEEDED SUCCESSFULLY!');
      console.log('Username: adminkaichon');
      console.log('Password: kaichon168');
      console.log('--------------------------------------------------');
    } else {
      console.log('Admin user already exists in database.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedAdmin();
