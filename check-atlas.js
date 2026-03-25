require('dotenv').config({ path: '/Users/babithsha/Downloads/lab-equipment-booking-system copy 2/.env' });
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

console.log('🔍 Checking MongoDB Atlas connection...');
console.log('📡 URI:', uri.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri)
  .then(async () => {
    console.log('\n✅ Successfully connected to MongoDB Atlas!\n');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections found:', collections.length);
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log('   -', col.name, ':', count, 'documents');
    }
    console.log('\n🎉 Atlas connection is working perfectly!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Connection FAILED:', err.message);
    process.exit(1);
  });
