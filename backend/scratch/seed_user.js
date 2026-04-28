import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.model.js';

const email = 'test@gmail.com';
const password = '123456';
const name = 'Test User';

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not set in environment');
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Delete existing if any to ensure fresh seed
    await User.deleteOne({ email: normalizedEmail });
    
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      isVerified: true,
      isActive: true,
      role: 'customer',
    });
    
    console.log('Successfully seeded user:');
    console.log('Email:', user.email);
    console.log('Password:', password);
    console.log('isVerified:', user.isVerified);
    
  } catch (err) {
    console.error('Failed to seed user:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

main();
