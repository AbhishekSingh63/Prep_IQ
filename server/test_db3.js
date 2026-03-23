import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import History from './models/History.js';

dotenv.config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prep_ai');
  const userCount = await User.countDocuments();
  const histCount = await History.countDocuments();
  console.log(`Remote DB users count: ${userCount}, history count: ${histCount}`);
  
  await mongoose.disconnect();
  
  try {
     await mongoose.connect('mongodb://127.0.0.1:27017/prep_ai');
     const localUserCount = await User.countDocuments();
     const localHistCount = await History.countDocuments();
     console.log(`Local DB users count: ${localUserCount}, history count: ${localHistCount}`);
     await mongoose.disconnect();
  } catch(e) {
     console.log("Could not connect to local DB:", e.message);
  }
}

run();
