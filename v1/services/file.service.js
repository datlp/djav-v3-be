'use strict';

const { BadRequestError } = require('../core/error.response');
const fileModel = require('../models/file.model');
const { findFilesFeed } = require('../models/repository/file.repo');
const videoModel = require('../models/video.model');
const { convertToObjectIdMongoDB } = require('../utils');
const VideoService = require('./video.service');
const FIELD_SELECT = ['-_id'];
const FEEDS = {
  create: ({ ctime }) => ({
    sort: { createOn: ctime, _id: -1 },
    select: FIELD_SELECT,
    // useCache: true,
  }),
  modify: ({ ctime }) => ({
    sort: { modifyOn: ctime, _id: -1 },
    select: FIELD_SELECT,
    // useCache: true,
  }),
};
class FileService {
  static async addFile(file) {
    file.video_id = convertToObjectIdMongoDB(file.video_id);
    const created = await fileModel.create(file);
    return created;
  }

  static async updateFile(file) {
    const { file_code } = file;
    if (file.video_id) {
      file.video_id = convertToObjectIdMongoDB(file.video_id);
    }
    const updatedFile = await fileModel
      .updateOne(
        {
          file_code,
        },
        file,
        { upsert: true, new: false }
      )
      .lean();

    return updatedFile;
  }
  static async checkFiles({ file_codes }) {
    return await fileModel
      .find({ file_code: { $in: file_codes } })
      .select(
        'file_bytes file_code file_name _id file_isDeleted file_deleteReason'
      )
      .lean();
  }
  static async createMultipleFiles({ multi }) {
    const result = await fileModel.insertMany(multi);
    const video_dvds = multi
      .filter(({ video_dvd }) => video_dvd)
      .map(({ video_dvd }) => VideoService.updateFiles({ video_dvd }));

    await Promise.all(video_dvds);

    return result;
  }
  static async updateMultipleFiles({ multi }) {
    return await Promise.all(
      multi.map(({ file_code, ...update }) =>
        fileModel.updateOne({ file_code }, update, { upsert: true }).lean()
      )
    );
  }
  // No public
  static async deleteFileUpdateVideo({ file_code, file_deleteReason = {} }) {
    const file = await fileModel
      .findOne({ file_code, file_isDeleted: false })
      .lean();
    if (!file) return;
    const { video_id } = file;
    file_deleteReason = JSON.stringify(file_deleteReason) || '';
    await fileModel.findOneAndUpdate(
      { file_code },
      {
        $set: {
          file_isDeleted: true,
          file_deleteReason,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    const [maxFile, video_files] = await Promise.all([
      fileModel
        .findOne({
          video_id: convertToObjectIdMongoDB(video_id),
          file_isDeleted: false,
        })
        .sort({ file_bytes: -1 })
        .lean(),
      fileModel
        .find({
          video_id,
          file_isDeleted: false,
        })
        .countDocuments(),
    ]);

    const video_fileMaxSize = maxFile?.file_bytes || 0;

    return await videoModel.findOneAndUpdate(
      {
        _id: video_id,
      },
      {
        $set: {
          video_fileMaxSize,
          video_files,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  }

  static async getFiles({
    type = 'create',
    ctime = -1,
    page = 1,
    searchKey = '',
  }) {
    if (ctime !== -1) ctime = 1;

    if (!FEEDS[type])
      throw new BadRequestError(`type:${type} is not supported`);

    const feed = FEEDS[type]({ ctime });

    return await findFilesFeed({
      ...feed,
      page,
      searchKey,
    });
  }
}

module.exports = FileService;
