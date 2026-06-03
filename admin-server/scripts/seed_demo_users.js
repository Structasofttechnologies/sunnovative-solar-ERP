import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import User from '../models/users/User.js';

dotenv.config();

const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@solarkits.com',
    password: '123456',
    role: 'admin',
    phone: '1234567890',
    status: 'active'
  },
  {
    name: 'Dealer User',
    email: 'dealer@solarkits.com',
    password: '123456',
    role: 'dealer',
    phone: '1234567891',
    status: 'active'
  },
  {
    name: 'Franchise User',
    email: 'franchise@solarkits.com',
    password: '123456',
    role: 'franchisee',
    phone: '1234567892',
    status: 'active'
  },
  {
    name: 'Dealer Manager',
    email: 'dealermanager@solarkits.com',
    password: '123456',
    role: 'dealerManager',
    phone: '1234567893',
    status: 'active'
  },
  {
    name: 'Franchise Manager',
    email: 'franchisemanager@example.com',
    password: 'password123',
    role: 'franchiseeManager',
    phone: '1234567894',
    status: 'active'
  }
];

const seedDemoUsers = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const userData of demoUsers) {
      let user = await User.findOne({ email: userData.email });
      
      // We don't hash manually because the pre('save') hook does it.
      if (user) {
        user.password = userData.password;
        user.role = userData.role;
        user.status = 'active';
        await user.save();
        console.log(`Updated existing user: ${userData.email} with password ${userData.password}`);
      } else {
        await User.create(userData);
        console.log(`Created new user: ${userData.email} with password ${userData.password}`);
      }
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding demo users:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedDemoUsers();
