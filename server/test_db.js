import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prep_ai');
  const users = await User.find({}, 'name email _id');
  console.log("Users:", users);
  mongoose.disconnect();
}

run();
