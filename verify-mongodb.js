const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/lab_equipment_booking';

async function verifyData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB!\n');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();

        console.log('📊 Database Collections:');
        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`  - ${collection.name}: ${count} documents`);
        }

        // Show sample data from each collection
        console.log('\n📝 Sample Data:\n');

        const users = await mongoose.connection.db.collection('users').find().limit(3).toArray();
        console.log('👥 Users (first 3):');
        users.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));

        const equipment = await mongoose.connection.db.collection('equipments').find().limit(3).toArray();
        console.log('\n🔬 Equipment (first 3):');
        equipment.forEach(e => console.log(`  - ${e.name} - Status: ${e.status}`));

        const bookings = await mongoose.connection.db.collection('bookings').find().limit(5).toArray();
        console.log('\n📅 Bookings (first 5):');
        bookings.forEach(b => console.log(`  - ${b.userName || 'Unknown'} - Equipment: ${b.equipmentName} - Status: ${b.status}`));

        console.log('\n✅ Database verification complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

verifyData();
