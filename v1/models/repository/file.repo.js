'use strict';

const { getSelectData, convertToObjectIdMongoDB } = require('../../utils');
const fileModel = require('../file.model');

const LIMIT = 24;
const findFile = async ({ filter = {}, select = [] }) => {
  return await fileModel.findOne(filter).select(getSelectData(select)).lean();
};
const findFiles = async ({
  filter = {},
  select = [],
  limit = 20,
  sort = 'ctime',
  page = 1,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { file_bytes: -1 } : { file_bytes: 1 };
  const files = await fileModel
    .find({ ...filter, file_isDeleted: false })
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
  return files;
};
const findFilesWithTotal = async ({
  filter = {},
  select = [],
  limit = 20,
  sort = 'ctime',
  page = 1,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { file_bytes: -1 } : { file_bytes: 1 };
  const [total, files] = await Promise.all([
    fileModel.find(filter).countDocuments(),
    fileModel
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .lean(),
  ]);
  return { total, limit, page, files };
};
const findAndUpdateFile = async ({
  video_id,
  code,
  name,
  bytes,
  extracted,
  type,
}) => {
  const query = {
    video_id: convertToObjectIdMongoDB(video_id),
    file_code: code,
  };
  const updateSet = {
    file_name: name,
    file_bytes: bytes,
    file_extracted: extracted,
    file_type: type,
    video_id: convertToObjectIdMongoDB(video_id),
    file_code: code,
  };
  const options = { upsert: true, new: true };

  return await fileModel.findOneAndUpdate(query, updateSet, options);
};

const findFilesFeed = async ({
  sort = {},
  select = [],
  filter = {},
  page = 1,
  searchKey = '',
}) => {
  const skip = (page - 1) * LIMIT;
  if (searchKey) {
    const regexSearch = new RegExp(`"${keySearch}"`);
    filter = { ...filter, $text: { $search: `"${regexSearch}"` } };
  }
  const [total, videos] = await Promise.all([
    fileModel.find(filter).countDocuments(),
    fileModel
      .find(filter, searchKey ? { score: { $meta: 'textScore' } } : {})
      .skip(skip)
      .limit(LIMIT)
      .sort(sort)
      .select(getSelectData(select))
      .lean(),
  ]);

  return { total, videos, page };
};
const fileRepo = {
  findFile,
  findFiles,
  findFilesWithTotal,
  findAndUpdateFile,
  findFilesFeed,
};

module.exports = fileRepo;
