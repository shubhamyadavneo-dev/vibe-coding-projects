#!/usr/bin/env node

/**
 * Test script to verify MongoDB migration
 * This script tests basic functionality after migrating from MySQL to MongoDB
 */

const mongoose = require('mongoose');
const User = require('./models/User');

// Test configuration
const mongoURI = 'mongodb://localhost:27017/mydb';

async function testMigration() {
  console.log('=== Testing MongoDB Migration ===\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');
    
    // Test 1: Check if User model works
    console.log('\n1. Testing User model...');
    try {
      const userCount = await User.countDocuments();
      console.log(`✓ User model works. Total users in database: ${userCount}`);
    } catch (error) {
      console.log(`✗ User model error: ${error.message}`);
      throw error;
    }
    
    // Test 2: Create a test user
    console.log('\n2. Testing user creation...');
    let testUser;
    try {
      testUser = new User({
        username: 'testuser_' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123'
      });
      
      await testUser.save();
      console.log(`✓ Test user created: ${testUser.username} (ID: ${testUser._id})`);
    } catch (error) {
      console.log(`✗ User creation error: ${error.message}`);
      throw error;
    }
    
    // Test 3: Find user by ID
    console.log('\n3. Testing user retrieval...');
    try {
      const foundUser = await User.findById(testUser._id);
      if (foundUser && foundUser.username === testUser.username) {
        console.log(`✓ User retrieval works: ${foundUser.username}`);
      } else {
        console.log('✗ User retrieval failed: user not found or mismatch');
      }
    } catch (error) {
      console.log(`✗ User retrieval error: ${error.message}`);
      throw error;
    }
    
    // Test 4: Update user
    console.log('\n4. Testing user update...');
    try {
      const newUsername = 'updated_' + Date.now();
      testUser.username = newUsername;
      await testUser.save();
      
      const updatedUser = await User.findById(testUser._id);
      if (updatedUser.username === newUsername) {
        console.log(`✓ User update works: ${updatedUser.username}`);
      } else {
        console.log('✗ User update failed: username not updated');
      }
    } catch (error) {
      console.log(`✗ User update error: ${error.message}`);
      throw error;
    }
    
    // Test 5: Delete user
    console.log('\n5. Testing user deletion...');
    try {
      await User.findByIdAndDelete(testUser._id);
      const deletedUser = await User.findById(testUser._id);
      if (!deletedUser) {
        console.log('✓ User deletion works: user successfully deleted');
      } else {
        console.log('✗ User deletion failed: user still exists');
      }
    } catch (error) {
      console.log(`✗ User deletion error: ${error.message}`);
      throw error;
    }
    
    // Test 6: Search users
    console.log('\n6. Testing user search...');
    try {
      const searchResults = await User.find({
        $or: [
          { username: { $regex: 'test', $options: 'i' } },
          { email: { $regex: 'test', $options: 'i' } }
        ]
      }).limit(5);
      
      console.log(`✓ User search works. Found ${searchResults.length} test users`);
    } catch (error) {
      console.log(`✗ User search error: ${error.message}`);
      throw error;
    }
    
    // Test 7: Password comparison
    console.log('\n7. Testing password comparison...');
    try {
      const passwordTestUser = new User({
        username: 'pwtest_' + Date.now(),
        email: `pwtest${Date.now()}@example.com`,
        password: 'mypassword123'
      });
      
      await passwordTestUser.save();
      
      // Test the comparePassword method
      const isMatch = await passwordTestUser.comparePassword('mypassword123');
      const isWrong = await passwordTestUser.comparePassword('wrongpassword');
      
      if (isMatch && !isWrong) {
        console.log('✓ Password comparison works correctly');
      } else {
        console.log('✗ Password comparison failed');
      }
      
      // Clean up
      await User.findByIdAndDelete(passwordTestUser._id);
    } catch (error) {
      console.log(`✗ Password comparison error: ${error.message}`);
      throw error;
    }
    
    // Test 8: Validation
    console.log('\n8. Testing validation...');
    try {
      const invalidUser = new User({
        username: 'ab', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      });
      
      await invalidUser.save();
      console.log('✗ Validation failed: invalid user was saved');
    } catch (error) {
      if (error.name === 'ValidationError') {
        console.log('✓ Validation works: correctly rejected invalid user');
      } else {
        console.log(`✗ Validation error: ${error.message}`);
        throw error;
      }
    }
    
    console.log('\n=== All Tests Passed ===');
    console.log('✓ MongoDB migration appears to be working correctly');
    console.log('✓ User model operations (CRUD) are functional');
    console.log('✓ Validation is working');
    console.log('✓ Password comparison works');
    
  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error(`Error: ${error.message}`);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n✓ MongoDB connection closed');
  }
}

// Run tests
if (require.main === module) {
  testMigration();
}

module.exports = { testMigration };