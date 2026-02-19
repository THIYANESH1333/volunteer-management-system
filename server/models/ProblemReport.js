const mongoose = require('mongoose');

const problemReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  photo: { type: Buffer }, // Store image as binary data
  photoType: { type: String }, // e.g., 'image/jpeg'
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

problemReportSchema.virtual('photoUrl').get(function() {
  if (this.photo && this.photoType) {
    return `data:${this.photoType};base64,${this.photo.toString('base64')}`;
  }
  return null;
});

module.exports = mongoose.model('ProblemReport', problemReportSchema); 