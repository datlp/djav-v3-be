'use strict'; // reduce rỏ rỉ bộ nhớ trong NodeJS
// !dmbg
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'View';
const COLLECTION_NAME = 'Views';

// Declare the Schema of the Mongo model
const viewSchema = new Schema(
  {
    view_date: { type: Date },
    view_videoId: { type: Types.ObjectId, ref: 'Video' },
    user_id: { type: Types.ObjectId, ref: 'User' },
    view_duration: { type: Number, default: 0 },
    view_ip: { type: String },
    view_userAgent: { type: String },
    view_referer: { type: String },
    view_dates: [{ type: Date }],
    view_count: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: 'createOn',
      updatedAt: 'modifyOn',
    },
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, viewSchema);
