import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/user.model.js';
import { hashPassword } from '../config/crypto.js';
import { join } from 'path';

// Load .env
config({ path: join(process.cwd(), '.env') });

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    const adminUsername = 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';

    const existingAdmin = await User.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      // Update password if needed
      const { salt, hash } = hashPassword(adminPassword);
      existingAdmin.passwordHash = hash;
      existingAdmin.passwordSalt = salt;
      existingAdmin.role = 'admin'; // ensure role
      await existingAdmin.save();
      console.log(`Admin password reset to: ${adminPassword}`);
    } else {
      console.log('Creating new admin user...');
      const { salt, hash } = hashPassword(adminPassword);
      await User.create({
        username: adminUsername,
        name: 'System Admin',
        passwordHash: hash,
        passwordSalt: salt,
        role: 'admin',
        isVerified: true
      });
      console.log(`Admin user created successfully! Username: ${adminUsername}, Password: ${adminPassword}`);
    }

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

seedAdmin();
