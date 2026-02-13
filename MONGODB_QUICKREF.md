# MongoDB Quick Reference Guide

## 🚀 Quick Start Commands

### Check if MongoDB is running
```bash
brew services list | grep mongodb
```

### Start/Stop MongoDB
```bash
# Start
brew services start mongodb/brew/mongodb-community

# Stop
brew services stop mongodb/brew/mongodb-community

# Restart
brew services restart mongodb/brew/mongodb-community
```

### Verify Your Data
```bash
node check-mongodb-status.js
```

## 💾 Data Management

### Backup Database
```bash
# Backup to ./backup directory
mongodump --uri="mongodb://localhost:27017/lab_equipment_booking" --out=./backup

# Backup with date
mongodump --uri="mongodb://localhost:27017/lab_equipment_booking" --out=./backup-$(date +%Y%m%d)
```

### Restore Database
```bash
# Restore from backup
mongorestore --uri="mongodb://localhost:27017/lab_equipment_booking" ./backup/lab_equipment_booking

# Drop existing data before restore
mongorestore --drop --uri="mongodb://localhost:27017/lab_equipment_booking" ./backup/lab_equipment_booking
```

### Re-migrate from JSON files
```bash
node migrate-to-mongodb.js
```
⚠️ **Warning**: This will delete all current MongoDB data!

## 🔍 Inspect Your Data

### Using MongoDB Shell (mongosh)
```bash
# Connect to database
mongosh mongodb://localhost:27017/lab_equipment_booking

# Once connected, run these commands:
```

### Common mongosh Commands
```javascript
// Show all collections
show collections

// Count documents
db.users.countDocuments()
db.bookings.countDocuments()
db.equipment.countDocuments()

// View all users
db.users.find().pretty()

// Find specific user
db.users.findOne({ email: "student@klu.ac.in" })

// View recent bookings
db.bookings.find().sort({ createdAt: -1 }).limit(10)

// Find bookings by status
db.bookings.find({ status: "Approved" })

// Find bookings by user email
db.bookings.find({ userEmail: "9923008027@klu.ac.in" })

// Update a booking status
db.bookings.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "Approved" } }
)

// Delete a booking
db.bookings.deleteOne({ _id: ObjectId("...") })

// Clear all bookings (careful!)
db.bookings.deleteMany({})

// Export collection to JSON
mongoexport --uri="mongodb://localhost:27017/lab_equipment_booking" --collection=users --out=users_export.json

// Import from JSON
mongoimport --uri="mongodb://localhost:27017/lab_equipment_booking" --collection=users --file=users_export.json
```

## 🛠️ Troubleshooting

### Can't connect to MongoDB
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Check MongoDB logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community
```

### Application can't connect
1. Check `.env` file has correct URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/lab_equipment_booking
   ```
2. Restart your Next.js dev server
3. Check terminal logs for connection errors

### Clear all data and start fresh
```bash
# Connect to mongosh
mongosh mongodb://localhost:27017/lab_equipment_booking

# In mongosh:
db.dropDatabase()

# Then re-run migration
exit
node migrate-to-mongodb.js
```

## 📊 Performance Monitoring

### Check Database Stats
```javascript
// In mongosh
db.stats()

// Collection stats
db.users.stats()
db.bookings.stats()

// Index information
db.users.getIndexes()
db.bookings.getIndexes()
```

### Create Indexes for Better Performance
```javascript
// In mongosh
db.users.createIndex({ email: 1 })
db.bookings.createIndex({ status: 1, date: 1 })
db.bookings.createIndex({ userEmail: 1 })
db.equipment.createIndex({ status: 1 })
```

## 🔐 Security Best Practices

### For Production

1. **Never commit `.env` file** - Already in .gitignore
2. **Use MongoDB Atlas** for production
3. **Enable authentication**:
   ```javascript
   // In mongosh as admin
   use admin
   db.createUser({
     user: "labadmin",
     pwd: "strong_password_here",
     roles: [ { role: "readWrite", db: "lab_equipment_booking" } ]
   })
   ```
4. **Update connection string** with credentials:
   ```
   MONGODB_URI=mongodb://labadmin:password@localhost:27017/lab_equipment_booking?authSource=admin
   ```

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free cloud database
- See `MONGODB_SETUP.md` for detailed setup information
