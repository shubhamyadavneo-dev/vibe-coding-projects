const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.price < 0) {
    this.price = 0;
  }
  next();
});

// Static method to find products by category
ProductSchema.statics.findByCategory = function(category) {
  return this.find({ category: category });
};

// Static method to get all products with limit
ProductSchema.statics.getAll = function(limit = 1000) {
  return this.find({}).limit(limit);
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;