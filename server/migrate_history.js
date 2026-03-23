import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import History from './models/History.js';

dotenv.config({ path: './.env' });

async function migrate() {
  const remoteUri = process.env.MONGO_URI;
  const localUri = 'mongodb://127.0.0.1:27017/prep_ai';

  if (!remoteUri) {
    console.error("No remote URI found in .env");
    return;
  }

  // 1. Fetch from Local DB
  console.log("Connecting to Local DB...");
  const localConn = await mongoose.createConnection(localUri).asPromise();
  const LocalUser = localConn.model('User', User.schema);
  const LocalHistory = localConn.model('History', History.schema);

  const localUsers = await LocalUser.find({});
  if (localUsers.length === 0) {
    console.log("No users in local DB.");
    localConn.close();
    return;
  }

  // 2. Fetch from Remote DB
  console.log("Connecting to Remote DB...");
  const remoteConn = await mongoose.createConnection(remoteUri).asPromise();
  const RemoteUser = remoteConn.model('User', User.schema);
  const RemoteHistory = remoteConn.model('History', History.schema);

  let migratedCount = 0;

  // Migrate histories
  for (const lUser of localUsers) {
    const email = lUser.email.toLowerCase().trim();
    const lHistories = await LocalHistory.find({ user: lUser._id }).lean();
    
    if (lHistories.length === 0) continue;

    // Find corresponding remote user
    const rUser = await RemoteUser.findOne({ email });
    if (!rUser) {
      console.log(`Remote user not found for ${email}. Skipping.`);
      continue;
    }

    console.log(`Migrating ${lHistories.length} histories for ${email}`);
    for (const h of lHistories) {
      // Check if already migrated (optional, but let's just insert)
      const existing = await RemoteHistory.findOne({
        user: rUser._id,
        createdAt: h.createdAt
      });
      if (!existing) {
        delete h._id; // Let mongoose generate a new ID
        h.user = rUser._id;
        await RemoteHistory.create(h);
        migratedCount++;
      }
    }
  }

  console.log(`Successfully migrated ${migratedCount} history records!`);

  await localConn.close();
  await remoteConn.close();
}

migrate().catch(console.error);
