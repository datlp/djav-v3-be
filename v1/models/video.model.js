'use strict'; // reduce rỏ rỉ bộ nhớ trong NodeJS
// !dmbg
const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Video';
const COLLECTION_NAME = 'Videos';

// Declare the Schema of the Mongo model
const videoSchema = new Schema(
  {
    // array
    video_actresses: { type: Array, default: [], index: true },
    video_categories: { type: Array, default: [], index: true },
    video_channels: { type: Array, default: [], index: true },
    video_covers: { type: Array, default: [] },
    video_demos: { type: Array, default: [] },
    video_gallery: { type: Array, default: [] },

    // string
    video_dvd: { type: String, require: true, unique: true, index: true },
    video_title: { type: String, require: true },

    // relate file model
    video_files: { type: Number, default: 0, index: true },
    video_fileMaxSize: { type: Number, default: 0, index: true },

    video_isDeleted: { type: Boolean, default: false },
    video_deleteReason: { type: String, default: '' },

    video_votes: { type: Number, default: 0 },

    // date time
    video_release: { type: Date },

    // relate view model
    video_lastViewed: { type: Date },
    video_views: { type: Number, default: 0 },
    video_history: {
      type: [{ type: Schema.Types.ObjectId, ref: 'View' }],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: 'createOn',
      updatedAt: 'modifyOn',
    },
    collection: COLLECTION_NAME,
  }
);

// index all indexed fields to text
videoSchema.index({
  video_actresses: 'text',
  video_categories: 'text',
  video_channels: 'text',
  video_dvd: 'text',
  video_title: 'text',
});

//Export the model
module.exports = model(DOCUMENT_NAME, videoSchema);
