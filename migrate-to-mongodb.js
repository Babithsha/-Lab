const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lab_equipment_booking';

// Read JSON data from files
const DATA_DIR = path.join(__dirname, 'data');

function readJSONFile(filename) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return data ? JSON.parse(data) : [];
        }
        return [];
    } catch (error) {
        console.error(`Error reading ${filename}:`, error.message);
        return [];
    }
}

// Define Schemas - without _id specification to let MongoDB generate them
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, required: true },
    image: { type: String },
    oldId: { type: String }, // Store the old ID for reference
    createdAt: { type: Date, default: Date.now },
});

const EquipmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lab: { type: String },
    status: { type: String, default: 'available' },
    description: { type: String },
    quantity: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    oldId: { type: String }, // Store the old ID for reference
    createdAt: { type: Date, default: Date.now },
});

const BookingSchema = new mongoose.Schema({
    user: { type: String },
    userId: { type: String },
    userEmail: { type: String },
    userName: { type: String },
    equipment: { type: String },
    equipmentId: { type: String },
    equipmentName: { type: String },
    lab: { type: String },
    date: { type: String },
    time: { type: String },
    duration: { type: String },
    purpose: { type: String },
    status: { type: String, default: 'pending' },
    staffNotes: { type: String },
    damageFine: { type: Number },
    damageDescription: { type: String },
    damageReportedBy: { type: String },
    damageFineAddedAt: { type: String },
    oldId: { type: String }, // Store the old ID for reference
    createdAt: { type: Date, default: Date.now },
});

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String },
    description: { type: String },
    type: { type: String, default: 'info' },
    priority: { type: String, default: 'normal' },
    oldId: { type: String }, // Store the old ID for reference
    createdAt: { type: Date, default: Date.now },
});

const LabSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    capacity: { type: Number },
    oldId: { type: String }, // Store the old ID for reference
    createdAt: { type: Date, default: Date.now },
});

const ExperimentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    procedure: { type: String },
    equipmentRequired: [{ type: String }],
    difficulty: { type: String },
    duration: { type: String },
    addedBy: { type: String },
    oldId: { type: String }, // Store the old ID for reference
    createdAt: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model('User', UserSchema);
const Equipment = mongoose.model('Equipment', EquipmentSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const Announcement = mongoose.model('Announcement', AnnouncementSchema);
const Lab = mongoose.model('Lab', LabSchema);
const Experiment = mongoose.model('Experiment', ExperimentSchema);

async function migrateData() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB!');

        // Read all JSON files
        const users = readJSONFile('users.json');
        const equipments = readJSONFile('equipments.json');
        const bookings = readJSONFile('bookings.json');
        const announcements = readJSONFile('announcements.json');
        const labs = readJSONFile('labs.json');
        const experiments = readJSONFile('experiments.json');

        console.log('\n📊 Data Summary:');
        console.log(`Users: ${users.length}`);
        console.log(`Equipment: ${equipments.length}`);
        console.log(`Bookings: ${bookings.length}`);
        console.log(`Announcements: ${announcements.length}`);
        console.log(`Labs: ${labs.length}`);
        console.log(`Experiments: ${experiments.length}`);

        // Clear existing data
        console.log('\n🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Equipment.deleteMany({});
        await Booking.deleteMany({});
        await Announcement.deleteMany({});
        await Lab.deleteMany({});
        await Experiment.deleteMany({});

        // Maps to track old ID to new ID conversion
        const userIdMap = {};
        const equipmentIdMap = {};

        // Migrate Users
        if (users.length > 0) {
            console.log('\n👥 Migrating users...');
            for (const user of users) {
                try {
                    const newUser = await User.create({
                        name: user.name,
                        email: user.email,
                        password: user.password || '',
                        role: user.role,
                        image: user.image,
                        oldId: user._id,
                        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                    });
                    userIdMap[user._id] = newUser._id.toString();
                    console.log(`  ✅ Migrated user: ${user.email}`);
                } catch (error) {
                    console.log(`  ⚠️  Skipped user ${user.email}: ${error.message}`);
                }
            }
        }

        // Migrate Equipment
        if (equipments.length > 0) {
            console.log('\n🔬 Migrating equipment...');
            for (const equipment of equipments) {
                try {
                    const newEquipment = await Equipment.create({
                        name: equipment.name,
                        lab: equipment.lab,
                        status: equipment.status || 'available',
                        description: equipment.description,
                        quantity: equipment.quantity || 1,
                        available: equipment.available || 1,
                        oldId: equipment._id,
                        createdAt: equipment.createdAt ? new Date(equipment.createdAt) : new Date(),
                    });
                    equipmentIdMap[equipment._id] = newEquipment._id.toString();
                    console.log(`  ✅ Migrated equipment: ${equipment.name}`);
                } catch (error) {
                    console.log(`  ⚠️  Skipped equipment ${equipment.name}: ${error.message}`);
                }
            }
        }

        // Migrate Bookings
        if (bookings.length > 0) {
            console.log('\n📅 Migrating bookings...');
            for (const booking of bookings) {
                try {
                    // Convert old user/equipment IDs to new ones if they exist
                    let userId = booking.user || booking.userId;
                    let equipmentId = booking.equipment || booking.equipmentId;

                    // Try to map to new IDs
                    if (userId && userIdMap[userId]) {
                        userId = userIdMap[userId];
                    }
                    if (equipmentId && equipmentIdMap[equipmentId]) {
                        equipmentId = equipmentIdMap[equipmentId];
                    }

                    const newBooking = await Booking.create({
                        user: userId,
                        userId: booking.userId,
                        userEmail: booking.userEmail,
                        userName: booking.userName,
                        equipment: equipmentId,
                        equipmentId: booking.equipmentId,
                        equipmentName: booking.equipmentName,
                        lab: booking.lab,
                        date: booking.date,
                        time: booking.time || '09:00',
                        duration: booking.duration,
                        purpose: booking.purpose,
                        status: booking.status || 'pending',
                        staffNotes: booking.staffNotes,
                        damageFine: booking.damageFine,
                        damageDescription: booking.damageDescription,
                        damageReportedBy: booking.damageReportedBy,
                        damageFineAddedAt: booking.damageFineAddedAt,
                        oldId: booking._id,
                        createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
                    });
                    console.log(`  ✅ Migrated booking for ${booking.userName || 'user'}`);
                } catch (error) {
                    console.log(`  ⚠️  Skipped booking: ${error.message}`);
                }
            }
        }

        // Migrate Announcements
        if (announcements.length > 0) {
            console.log('\n📢 Migrating announcements...');
            for (const announcement of announcements) {
                try {
                    await Announcement.create({
                        title: announcement.title,
                        message: announcement.message || announcement.description || '',
                        description: announcement.description,
                        type: announcement.type || 'info',
                        priority: announcement.priority || 'normal',
                        oldId: announcement._id,
                        createdAt: announcement.createdAt ? new Date(announcement.createdAt) : new Date(),
                    });
                    console.log(`  ✅ Migrated announcement: ${announcement.title}`);
                } catch (error) {
                    console.log(`  ⚠️  Skipped announcement ${announcement.title}: ${error.message}`);
                }
            }
        }

        // Migrate Labs
        if (labs.length > 0) {
            console.log('\n🏢 Migrating labs...');
            for (const lab of labs) {
                try {
                    await Lab.create({
                        name: lab.name,
                        description: lab.description,
                        location: lab.location,
                        capacity: lab.capacity,
                        oldId: lab._id,
                        createdAt: lab.createdAt ? new Date(lab.createdAt) : new Date(),
                    });
                    console.log(`  ✅ Migrated lab: ${lab.name}`);
                } catch (error) {
                    console.log(`  ⚠️  Skipped lab ${lab.name}: ${error.message}`);
                }
            }
        }

        // Migrate Experiments
        if (experiments.length > 0) {
            console.log('\n🧪 Migrating experiments...');
            for (const experiment of experiments) {
                try {
                    // Handle procedure - convert array to string if needed
                    let procedure = experiment.procedure;
                    if (Array.isArray(procedure)) {
                        procedure = procedure.join('\n');
                    }

                    await Experiment.create({
                        title: experiment.title,
                        description: experiment.description || 'No description',
                        procedure: procedure,
                        equipmentRequired: experiment.equipmentRequired || [],
                        difficulty: experiment.difficulty,
                        duration: experiment.duration,
                        addedBy: experiment.addedBy,
                        oldId: experiment._id,
                        createdAt: experiment.createdAt ? new Date(experiment.createdAt) : new Date(),
                    });
                    console.log(`  ✅ Migrated experiment: ${experiment.title}`);
                } catch (error) {
                    console.log(`  ⚠️  Skipped experiment ${experiment.title}: ${error.message}`);
                }
            }
        }

        // Verify migration
        console.log('\n✨ Migration Summary:');
        const counts = {
            users: await User.countDocuments(),
            equipment: await Equipment.countDocuments(),
            bookings: await Booking.countDocuments(),
            announcements: await Announcement.countDocuments(),
            labs: await Lab.countDocuments(),
            experiments: await Experiment.countDocuments(),
        };

        console.log(`✅ Users: ${counts.users}`);
        console.log(`✅ Equipment: ${counts.equipment}`);
        console.log(`✅ Bookings: ${counts.bookings}`);
        console.log(`✅ Announcements: ${counts.announcements}`);
        console.log(`✅ Labs: ${counts.labs}`);
        console.log(`✅ Experiments: ${counts.experiments}`);

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n⚠️  Note: Old IDs have been stored in the "oldId" field for reference.');
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

// Run migration
migrateData();
