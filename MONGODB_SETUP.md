# MongoDB Integration for Lab Equipment Booking System

## ✅ Setup Complete!

Your lab equipment booking system is now connected to MongoDB and all data is being saved to the database.

## 📊 What Was Done

### 1. **MongoDB Installation & Configuration**
- ✅ Installed MongoDB Community Edition via Homebrew
- ✅ Started MongoDB service (runs automatically on system startup)
- ✅ Connected to database: `lab_equipment_booking`

### 2. **Database Connection**
- ✅ Updated `lib/db.ts` with proper MongoDB connection handling
- ✅ Implemented connection caching for serverless environments
- ✅ Added error handling and connection status logging

### 3. **Mongoose Models Created**
Updated `lib/models.ts` with proper Mongoose schemas for:
- **Users** - Authentication and user management
- **Equipment** - Lab equipment inventory
- **Bookings** - Equipment reservations
- **Announcements** - System announcements
- **Labs** - Laboratory locations
- **Experiments** - Experiment library

### 4. **Data Migration**
- ✅ Migrated **9 users** from JSON to MongoDB
- ✅ Migrated **1 equipment** item
- ✅ Migrated **16 bookings**
- ✅ Migrated **1 announcement**
- ✅ Migrated **1 lab**
- ✅ Migrated **1 experiment**

All original IDs were stored in an `oldId` field for backward compatibility.

## 🔧 MongoDB Commands

### Check MongoDB Status
```bash
brew services list | grep mongodb
```

### Start MongoDB
```bash
brew services start mongodb/brew/mongodb-community
```

### Stop MongoDB
```bash
brew services stop mongodb/brew/mongodb-community
```

### Restart MongoDB
```bash
brew services restart mongodb/brew/mongodb-community
```

### Connect to MongoDB Shell
```bash
mongosh mongodb://localhost:27017/lab_equipment_booking
```

## 📝 Useful MongoDB Shell Commands

Once in mongosh:

```javascript
// Show all collections
show collections

// Count documents in each collection
db.users.countDocuments()
db.bookings.countDocuments()
db.equipments.countDocuments()
db.announcements.countDocuments()
db.labs.countDocuments()
db.experiments.countDocuments()

// View all users
db.users.find().pretty()

// View all bookings
db.bookings.find().pretty()

// Find a specific user by email
db.users.findOne({ email: "student@klu.ac.in" })

// View recent bookings
db.bookings.find().sort({ createdAt: -1 }).limit(5)

// Delete all data (use with caution!)
db.users.deleteMany({})
db.bookings.deleteMany({})
```

## 🛠️ Utility Scripts

### Test Database Connection
```bash
node test-db.js
```

### Verify Data in MongoDB
```bash
node verify-mongodb.js
```

### Re-run Migration (if needed)
```bash
node migrate-to-mongodb.js
```
⚠️ **Warning**: This will delete all existing MongoDB data and re-import from JSON files!

## 🔒 Environment Variables

Your `.env` file contains:
```
MONGODB_URI=mongodb://localhost:27017/lab_equipment_booking
```

For production, update this to your MongoDB Atlas connection string or your production database URL.

## 📈 Database Schema Overview

### Users Collection
- name, email, password, role, image
- Roles: student, technician, admin
- Unique email constraint

### Bookings Collection
- user, userName, userEmail
- equipment, equipmentName, equipmentId
- date, time, duration, purpose
- status (pending, approved, denied)
- damageFine, damageDescription, damageReportedBy
- Tracks all equipment reservations

### Equipment Collection
- name, lab, status, description
- quantity, available
- Inventory management

### Announcements Collection
- title, message, type, priority
- System-wide notifications

### Labs Collection  
- name, description, location, capacity
- Laboratory locations

### Experiments Collection
- title, description, procedure
- equipmentRequired, difficulty, duration
- Experiment library for students

## 🚀 Next Steps

### Production Deployment

When deploying to production:

1. **Use MongoDB Atlas** (recommended) or your own MongoDB server
2. Update `.env` with production MongoDB URI:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lab_equipment_booking
   ```
3. Add `.env` to `.gitignore` to protect credentials
4. Run migration script on production database

### Backup Your Data

Regular backups are important:

```bash
# Backup all data
mongodump --uri="mongodb://localhost:27017/lab_equipment_booking" --out=./backup

# Restore from backup
mongorestore --uri="mongodb://localhost:27017/lab_equipment_booking" ./backup/lab_equipment_booking
```

## ⚡ Performance Tips

1. **Indexes**: MongoDB automatically indexes the `_id` field. Add custom indexes for frequently queried fields:
   ```javascript
   db.users.createIndex({ email: 1 })
   db.bookings.createIndex({ status: 1, date: 1 })
   ```

2. **Connection Pooling**: Already implemented in `lib/db.ts` for optimal performance

3. **Query Optimization**: Use `.lean()` for read-only operations to improve performance

## 🐛 Troubleshooting

### Connection Errors

If you see connection errors:
1. Ensure MongoDB is running: `brew services list | grep mongodb`
2. Check the connection string in `.env`
3. View logs: `tail -f /opt/homebrew/var/log/mongodb/mongo.log`

### Server Won't Start

```bash
# Restart the dev server
# Press Ctrl+C in the terminal running npm run dev
npm run dev
```

## ✨ All Done!

Your application is now fully integrated with MongoDB. All data from your JSON files has been migrated and your application is saving all new data directly to the database!

The old JSON files in the `data/` directory are preserved as backups but are no longer being used by the application.
