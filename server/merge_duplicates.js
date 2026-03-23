import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import History from './models/History.js';

dotenv.config({ path: './.env' });

async function mergeDuplicates() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prep_ai');
  
  const users = await User.find({});
  const emailMap = {};
  
  for (const user of users) {
    const canonicalEmail = user.email.toLowerCase().trim();
    if (!emailMap[canonicalEmail]) {
      emailMap[canonicalEmail] = [];
    }
    emailMap[canonicalEmail].push(user);
  }
  
  let mergedCount = 0;
  
  for (const [email, duplicates] of Object.entries(emailMap)) {
    if (duplicates.length > 1) {
      console.log(`Found duplicates for ${email}: ${duplicates.length} accounts.`);
      // Sort by creation date, keep the oldest one as primary
      duplicates.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      const primaryUser = duplicates[0];
      const otherUsers = duplicates.slice(1);
      
      for (const otherUser of otherUsers) {
        // Update history records to point to primaryUser
        const updateResult = await History.updateMany(
          { user: otherUser._id },
          { $set: { user: primaryUser._id } }
        );
        console.log(`Reassigned ${updateResult.modifiedCount} history records from ${otherUser._id} to ${primaryUser._id}`);
        
        // Delete the duplicate user
        await User.deleteOne({ _id: otherUser._id });
        console.log(`Deleted duplicate user ${otherUser._id}`);
        mergedCount++;
      }
      
      // Update primary user email to canonical (optional)
      primaryUser.email = email;
      await primaryUser.save();
    }
  }
  
  console.log(`Merged ${mergedCount} duplicate accounts.`);
  
  // also fix all users in db to use canonical email
  if (mergedCount === 0) {
     for (const user of users) {
        const canonical = user.email.toLowerCase().trim();
        if (user.email !== canonical) {
           user.email = canonical;
           await user.save();
           console.log(`Updated casing/spacing for user ${user._id}`);
        }
     }
  }
  
  mongoose.disconnect();
}

mergeDuplicates().catch(console.error);
