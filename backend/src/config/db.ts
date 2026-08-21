import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { hashPassword } from './crypto.js';

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaichon-plus';
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Auto seed admin user
    await seedAdmin();
  } catch (error) {
    console.error(`Error connecting to MongoDB:`, error);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const password = 'admin1234';
      const { salt, hash } = hashPassword(password);
      
      await User.create({
        username: 'admin',
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
      console.log('Username: admin');
      console.log('Password: admin1234');
      console.log('--------------------------------------------------');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};
