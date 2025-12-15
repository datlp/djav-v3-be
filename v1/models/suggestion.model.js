// model/suggestion.model.js
const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema(
  {
    suggestion: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // Index for basic prefix matching
    },
    type: {
      type: String,
      enum: ['video_title', 'channel_name', 'keyword'],
      default: 'video_title',
    },
    popularity: {
      type: Number,
      default: 0,
      index: true, // Index for sorting by popularity
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Suggestion = mongoose.model('Suggestion', suggestionSchema);

module.exports = Suggestion;
