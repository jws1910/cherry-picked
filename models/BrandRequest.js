const mongoose = require('mongoose');

const brandRequestSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
    trim: true
  },
  brandWebsite: {
    type: String,
    required: true,
    trim: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['new brand', 'in progress', 'added', 'rejected'],
    default: 'new brand'
  },
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add index for efficient querying
brandRequestSchema.index({ status: 1, createdAt: -1 });
brandRequestSchema.index({ requestedBy: 1 });

module.exports = mongoose.model('BrandRequest', brandRequestSchema); 