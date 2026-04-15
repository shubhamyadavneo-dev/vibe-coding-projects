#!/usr/bin/env node

/**
 * Migration script to migrate users from MySQL to MongoDB
 * This script reads all users from MySQL and inserts them into MongoDB
 * 
 * Usage: node migrate-users.js
 */

const mysql = require('mysql');
const mongoose = require('mongoose');
const User = require('./models/User');

// MySQL connection configuration
// TODO: Need to store these credentials securely in environment variables for production use
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123', // This should come from environment variables in production
  database: 'mydb'
});

// MongoDB connection - use environment variable or default
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydb';

async function migrateUsers() {
  console.log('Starting user migration from MySQL to MongoDB...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    
    // Connect to MySQL
    await new Promise((resolve, reject) => {
      mysqlConnection.connect((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to MySQL');
          resolve();
        }
      });
    });
    
    // Fetch all users from MySQL
    const users = await new Promise((resolve, reject) => {
      mysqlConnection.query('SELECT * FROM users', (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    
    console.log(`Found ${users.length} users in MySQL`);
    
    // Migrate each user to MongoDB
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const mysqlUser of users) {
      try {
        // Check if user already exists in MongoDB (by email or username)
        const existingUser = await User.findOne({
          $or: [
            { email: mysqlUser.email },
            { username: mysqlUser.username }
          ]
        });
        
        if (existingUser) {
          console.log(`Skipping user ${mysqlUser.username} (already exists in MongoDB)`);
          skippedCount++;
          continue;
        }
        
        // Create new MongoDB user document
        const mongoUser = new User({
          username: mysqlUser.username,
          email: mysqlUser.email,
          password: mysqlUser.password, // Note: passwords are stored in plaintext in MySQL
          createdAt: mysqlUser.created_at || new Date(),
          updatedAt: mysqlUser.updated_at || new Date()
        });
        
        await mongoUser.save();
        migratedCount++;
        console.log(`Migrated user: ${mysqlUser.username} (ID: ${mysqlUser.id})`);
        
      } catch (error) {
        console.error(`Error migrating user ${mysqlUser.username}:`, error.message);
        errorCount++;
      }
    }
    
    // Print migration summary
    console.log('\n=== Migration Summary ===');
    console.log(`Total users in MySQL: ${users.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    
    // Verify migration
    const totalMongoUsers = await User.countDocuments();
    console.log(`Total users in MongoDB after migration: ${totalMongoUsers}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    mysqlConnection.end();
    await mongoose.connection.close();
    console.log('Connections closed');
    process.exit(0);
  }
}

// Run migration
if (require.main === module) {
  migrateUsers();
}

module.exports = { migrateUsers };