// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, unique: true, index: true }, // Ensure username is required and indexed
    otp: String,
    otpExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
    isVerified: { type: Boolean, default: false },

    displayName: { type: String },
    profilePictureUrl: { type: String },

    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following_count: { type: Number, default: 0, index: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers_count: { type: Number, default: 0, index: true },

    richTexts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RichText' }],
    richTexts_count: { type: Number, default: 0, index: true },

    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  },
  { timestamps: true }
);

// --- Keep existing pre/post save hooks and methods ---

userSchema.pre('save', async function (next) {
  // Generate username if it's a new user and username is not provided
  if (this.isNew && !this.username) {
    const emailParts = this.email.split('@')[0];
    let baseUsername = emailParts.replace(/[^a-zA-Z0-9]/g, ''); // Sanitize username
    if (!baseUsername) baseUsername = 'user'; // Fallback if email name is empty after sanitizing
    let counter = 0;
    let username = baseUsername;

    // Ensure unique username generation logic is robust
    while (await this.constructor.findOne({ username })) {
      counter++;
      username = `${baseUsername}${counter}`;
    }
    this.username = username;
  }
  next();
});
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};
userSchema.methods.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      username: this.username,
      // Add other relevant non-sensitive info if needed
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    }
  );
};
// generateResetToken
userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetToken = token;
  this.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  return token;
};

module.exports = mongoose.model('User', userSchema);
