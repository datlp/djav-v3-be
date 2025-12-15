'use strict';

const moment = require('moment');
const { getSelectData, convertToObjectIdMongoDB } = require('../../utils');
const videoModel = require('../video.model');
const fileRepo = require('./file.repo');

const LIMIT = 24;

const findVideos = async ({
  sort = {},
  select = [],
  filter = {},
  page = 1,
  searchKey = '',
}) => {
  const skip = (page - 1) * LIMIT;
  if (searchKey) {
    const words = searchKey.split(' ').filter(Boolean);

    filter = {
      ...filter,
      // $or: [
      //   {
      //     $and: words.map((word) => ({
      //       video_dvd: { $regex: word, $options: 'i' },
      //     })),
      //   },
      //   {
      //     $and: words.map((word) => ({
      //       video_title: { $regex: word, $options: 'i' },
      //     })),
      //   },
      //   {
      //     $and: words.map((word) => ({
      //       video_actresses: { $regex: word, $options: 'i' },
      //     })),
      //   },
      //   {
      //     $and: words.map((word) => ({
      //       video_categories: { $regex: word, $options: 'i' },
      //     })),
      //   },
      //   {
      //     $and: words.map((word) => ({
      //       video_channels: { $regex: word, $options: 'i' },
      //     })),
      //   },
      // ],
      $text: { $search: words.map((word) => `"${word}"`).join(' ') },
    };
  }
  const [total, videos] = await Promise.all([
    videoModel.find(filter).countDocuments(),
    videoModel
      .find(filter)
      .skip(skip)
      .limit(LIMIT)
      .sort(sort)
      .select(getSelectData(select))
      .lean(),
  ]);

  return { total, videos, page };
};
const findVideo = async ({ filter = {}, select = [] }) => {
  const videos = await videoModel
    .findOne(filter)
    .select(getSelectData(select))
    .lean();

  return videos;
};

const findVideoFiles = async ({ filter = {}, select = [] }) => {
  const videos = await findVideo({ filter, select });

  const files = await fileRepo.findFiles({
    filter: { video_id: convertToObjectIdMongoDB(videos._id) },
  });

  return { ...videos, files };
};

const findAndUpdateVideo = async ({
  dvd,
  actresses = [],
  categories = [],
  channels = [],
  contentId,
  covers = [],
  files = [],
  release,
  title,
}) => {
  const query = {
    video_dvd: dvd,
  };
  const updateSet = {
    video_actresses: actresses,
    video_categories: categories,
    video_channels: channels,
    video_contentId: contentId,
    video_covers: covers,
    video_files: files,
    video_release: release && moment(release, `YYYYMMDD`),
    video_title: title,
  };
  const options = { upsert: true, new: true };

  return await videoModel.findOneAndUpdate(query, updateSet, options);
};

const videoRepo = {
  findVideo,
  findVideoFiles,
  findAndUpdateVideo,
  findVideos,
};

module.exports = videoRepo;
