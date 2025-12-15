'use strict';
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { addView } = require('./view.service');
const { concatUniqueArrays } = require('../utils');
const videoModel = require('../models/video.model');
const fileModel = require('../models/file.model');
const videoRepo = require('../models/repository/video.repo');

const { FeedConfigFactory } = require('../config/video.config');
const viewModel = require('../models/view.model');

class VideoService {
  static async getVideoList({
    type = '',
    ctime = -1,
    page = 1,
    searchKey = '',
  }) {
    if (ctime !== -1) ctime = 1;

    const feed = FeedConfigFactory.createConfig(type);
    if (!feed.useCache) {
      return await videoRepo.findVideos({
        ...feed,
        page,
        searchKey,
      });
    }

    const result = await videoRepo.findVideos({
      ...feed,
      page,
      searchKey,
    });
    // this.cacheMoreVideos({ type, page, ctime, searchKey });
    return result;
  }
  // getVideoHistory;
  static async getVideoHistory({
    type = 'history',
    ctime = -1,
    page = 1,
    searchKey = '',
    userId,
  }) {
    return await viewModel
      .find({
        user_id: userId,
      })
      .populate({
        path: 'view_videoId',
        select: 'video_dvd video_title video_covers video_release',
        model: 'Video',
      })
      .sort({
        modifyOn: -1,
      })
      .lean()
      .then((views) => {
        console.log('🚀 ~ VideoService ~ .then ~ views:', views);
        console.log('🚀 ~ VideoService ~ .then ~ views:', views.length);
        const videos = views.map((view) => view.view_videoId).filter(Boolean);
        return {
          videos,
          page,
          total: videos.length,
        };
      });
  }

  static async getVideo({ video_dvd, user_id }) {
    console.log(`retrieved:: from Mongo`);
    const result = await videoRepo.findVideoFiles({
      filter: { video_dvd: String(video_dvd).toUpperCase() },
    });
    addView(video_dvd, user_id);
    return result;
  }

  static async searchVideo({ keySearch, limit = 20, page = 1 }) {
    const result = await searchVideo({
      keySearch,
      limit: +limit,
      page: +page,
      sort: 'ctime',
      select: [
        'video_dvd',
        'video_lastViewed',
        'video_release',
        'video_title',
        'video_covers',
        'video_files',
      ],
    });
    return result;
  }
  static async voteVideo({ video_dvd, ...rest }) {
    const video = { video_dvd, ...rest };
    const found = await videoModel.findOne({ video_dvd }).lean();
    if (!found || Object.keys(found).length === 0)
      throw new BadRequestError(`${video_dvd} not found`);

    video.video_votes = found.video_votes + 1 || 1;

    const edited = await videoModel
      .findOneAndUpdate(
        {
          video_dvd,
        },
        video,
        { upsert: true, new: true }
      )
      .lean();
    return edited;
  }

  static async updateVideo({ video_dvd, ...rest }) {
    const video = { video_dvd, ...rest };
    const found = await videoModel.findOne({ video_dvd }).lean();
    if (!found || Object.keys(found).length === 0)
      throw new BadRequestError(`${video_dvd} not found`);

    const { video_actresses, video_categories, video_covers, video_channels } =
      found;

    try {
      video.video_actresses = concatUniqueArrays(
        video_actresses,
        video.video_actresses
      );
      video.video_categories = concatUniqueArrays(
        video_categories,
        video.video_categories
      );
      video.video_covers = concatUniqueArrays(video_covers, video.video_covers);
      video.video_channels = concatUniqueArrays(
        video_channels,
        video.video_channels
      );
    } catch (error) {
      throw new BadRequestError(error.message);
    }

    const edited = await videoModel
      .findOneAndUpdate(
        {
          video_dvd,
        },
        video,
        { upsert: true, new: true }
      )
      .lean();
    return edited;
  }

  static async createVideo(video) {
    const { _id } = (await videoModel.create(video)) || {};
    return { _id };
  }

  static async updateFiles({ video_dvd }) {
    (async () => {
      const [{ file_bytes: video_fileMaxSize }, video_files] =
        await Promise.all([
          fileModel
            .findOne({ video_dvd, file_isDeleted: false })
            .sort({ file_bytes: -1 })
            .select('file_bytes')
            .limit(1)
            .lean(),
          fileModel.find({ video_dvd, file_isDeleted: false }).countDocuments(),
        ]);
      return await videoModel
        .findOneAndUpdate(
          { video_dvd },
          { video_fileMaxSize, video_files },
          { upsert: true }
        )
        .lean();
    })().catch((e) => {
      throw new NotFoundError(`[${video_dvd}] not found`);
    });
  }
  /*

*/
  static async createVideos({ multi }) {
    return await videoModel.insertMany(multi);
  }
  static async updateVideos({ multi }) {
    return await Promise.all(
      multi.map(({ video_dvd, ...update }) =>
        videoModel.updateOne({ video_dvd }, update, { upsert: true })
      )
    );
  }
  static async checkVideos({ video_dvds }) {
    return await videoModel
      .find({ video_dvd: { $in: video_dvds } })
      .select('_id video_dvd')
      .lean();
  }
  static async deleteVideo({ video_dvd }) {
    return await videoModel.updateOne(
      { video_dvd },
      { $set: { video_isDeleted: false, video_deleteReason: 'API delete' } }
    );
  }
  static async deleteVideoForever({ video_dvd }) {
    await fileModel.deleteMany({ video_dvd });
    return await videoModel.deleteMany({ video_dvd });
  }
}

module.exports = VideoService;
