import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { hashPassword } from './crypto.js';

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaichon-plus';
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop unique index on code in chickens collection if it exists
    try {
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections({ name: 'chickens' }).toArray();
        if (collections.length > 0) {
          await db.collection('chickens').dropIndex('code_1').catch(() => {
            // Ignore error if index doesn't exist
          });
        }
      }
    } catch (indexErr) {
      console.error('Error dropping code_1 index:', indexErr);
    }

    // Auto seed admin user
    await seedAdmin();
  } catch (error) {
    console.error(`Error connecting to MongoDB:`, error);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
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
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};
