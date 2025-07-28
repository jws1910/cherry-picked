const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  favoriteBrands: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 5; // Maximum 5 favorite brands
      },
      message: 'Cannot have more than 5 favorite brands'
    }
  },

  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update favorite brands
userSchema.methods.updateFavoriteBrands = function(brands) {
  if (brands.length > 5) {
    throw new Error('Cannot have more than 5 favorite brands');
  }
  this.favoriteBrands = brands;
  return this.save();
};

// Method to add a favorite brand
userSchema.methods.addFavoriteBrand = function(brandKey) {
  if (this.favoriteBrands.length >= 5) {
    throw new Error('Cannot add more than 5 favorite brands');
  }
  if (!this.favoriteBrands.includes(brandKey)) {
    this.favoriteBrands.push(brandKey);
  }
  return this.save();
};

// Method to remove a favorite brand
userSchema.methods.removeFavoriteBrand = function(brandKey) {
  this.favoriteBrands = this.favoriteBrands.filter(brand => brand !== brandKey);
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 