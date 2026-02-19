// Run with: node scripts/fixUserIndexes.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find();

  // Remove duplicate emails (keep the first occurrence)
  const seenEmails = new Set();
  for (const user of users) {
    if (seenEmails.has(user.email)) {
      await User.deleteOne({ _id: user._id });
      console.log('Deleted duplicate email user:', user.email);
    } else {
      seenEmails.add(user.email);
    }
  }

  // Remove duplicate phones (keep the first occurrence)
  const users2 = await User.find();
  const seenPhones = new Set();
  for (const user of users2) {
    if (seenPhones.has(user.phone)) {
      await User.deleteOne({ _id: user._id });
      console.log('Deleted duplicate phone user:', user.phone);
    } else {
      seenPhones.add(user.phone);
    }
  }

  // Drop and recreate unique indexes
  await User.collection.dropIndex('email_1').catch(() => {});
  await User.collection.dropIndex('phone_1').catch(() => {});
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ phone: 1 }, { unique: true });
  console.log('Indexes rebuilt.');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); }); 