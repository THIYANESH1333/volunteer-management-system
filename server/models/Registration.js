const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'no-show'],
    default: 'registered'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  attendedAt: {
    type: Date
  }
});

// Ensure unique registration per volunteer per event
registrationSchema.index({ event: 1, volunteer: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema); 