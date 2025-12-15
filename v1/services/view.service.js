'use strict';

const videoModel = require('../models/video.model');
const viewModel = require('../models/view.model');
const userModel = require('../models/user.model');
const { convertToObjectIdMongoDB } = require('../utils');

class ViewService {
  static async addView(video_dvd, user_id) {
    const video = await videoModel.findOne({ video_dvd }).select('_id').lean();
    if (!video) return;
    if (user_id) {
      //
      const user = await userModel
        .findOne({ _id: user_id })
        .select('_id')
        .lean();
      if (!user) return;
      await viewModel.findOneAndUpdate(
        {
          user_id: convertToObjectIdMongoDB(user_id),
          view_videoId: convertToObjectIdMongoDB(video._id),
        },
        {
          $inc: { view_count: 1 },
          $push: { view_dates: new Date() },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    return await videoModel.findOneAndUpdate(
      { _id: video._id },
      {
        $inc: { video_views: 1 },
        video_lastViewed: new Date(),
      }
    );
  }
}

module.exports = ViewService;
