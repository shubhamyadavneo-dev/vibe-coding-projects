#!/usr/bin/env node

/**
 * Test if server.js can be required without errors
 * This helps identify module loading issues before starting the server
 */

console.log('Testing server.js module loading...\n');

try {
  // Clear mongoose models to avoid "Cannot overwrite model" errors
  const mongoose = require('mongoose');
  mongoose.models = {};
  mongoose.modelSchemas = {};
  
  // Now require the server
  const app = require('./server.js');
  
  console.log('✅ Successfully loaded server.js module');
  console.log('✅ No model compilation errors');
  console.log('✅ Server instance created:', typeof app);
  
  // Check if mongoose is connected
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB is connected');
  } else {
    console.log('⚠️  MongoDB connection state:', mongoose.connection.readyState);
    console.log('   (0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting)');
  }
  
  process.exit(0);
  
} catch (error) {
  console.error('❌ Error loading server.js:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Provide specific guidance based on error type
  if (error.message.includes('Cannot overwrite')) {
    console.error('\n🔧 Fix suggestion: This is a Mongoose model conflict.');
    console.error('   A model is being defined multiple times. Check:');
    console.error('   1. Duplicate model definitions in model files');
    console.error('   2. Multiple files trying to define the same model');
    console.error('   3. Circular dependencies between model files');
  } else if (error.message.includes('Module not found')) {
    console.error('\n🔧 Fix suggestion: Missing dependency.');
    console.error('   Run: npm install');
  }
  
  process.exit(1);
}