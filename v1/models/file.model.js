'use strict'; // reduce rỏ rỉ bộ nhớ trong NodeJS
// !dmbg
const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'File';
const COLLECTION_NAME = 'Files';

// Declare the Schema of the Mongo model
const FileSchema = new Schema(
  {
    file_code: { type: String, unique: true, index: true },
    file_name: { type: String, default: '' },
    file_name_no_accent: { type: String, default: '', index: true },

    file_bytes: { type: Number, default: 0 },
    file_isDeleted: { type: Boolean, default: false },
    file_deleteReason: { type: String, default: '' },

    video_dvd: { type: String, require: true, index: true },
    video_id: { type: Types.ObjectId, ref: 'Video', require: true },
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
module.exports = model(DOCUMENT_NAME, FileSchema);
