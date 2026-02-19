const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['volunteer', 'admin'],
    default: 'volunteer'
  },
  profilePic: {
    type: Buffer
  },
  profilePicType: {
    type: String
  }
}, { timestamps: true });

userSchema.virtual('profilePicUrl').get(function() {
  if (this.profilePic && this.profilePicType) {
    return `data:${this.profilePicType};base64,${this.profilePic.toString('base64')}`;
  }
  return null;
});

userSchema.pre('remove', async function(next) {
  const Registration = require('./Registration');
  const ProblemReport = require('./ProblemReport');
  const Event = require('./Event');
  await Registration.deleteMany({ volunteer: this._id });
  await ProblemReport.deleteMany({ volunteer: this._id });
  await Event.deleteMany({ createdBy: this._id });
  next();
});

userSchema.statics.safeDeleteById = async function(userId) {
  const user = await this.findById(userId);
  if (!user) return null;
  const Registration = require('./Registration');
  const ProblemReport = require('./ProblemReport');
  const Event = require('./Event');
  await Registration.deleteMany({ volunteer: user._id });
  await ProblemReport.deleteMany({ volunteer: user._id });
  await Event.deleteMany({ createdBy: user._id });
  await user.deleteOne();
  return user;
};

module.exports = mongoose.model('User', userSchema);
