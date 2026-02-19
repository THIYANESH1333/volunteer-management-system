const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  locationCoordinates: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  maxVolunteers: {
    type: Number,
    required: true
  },
  currentVolunteers: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tasks: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema); 