'use strict';

const _ = require('lodash');

const { Types } = require('mongoose');

const convertToObjectIdMongoDB = (id) => new Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) delete obj[key];
  });
  return obj;
};

const updateNestedObjectParser = (obj) => {
  const final = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) {
      delete obj[key];
    } else {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        const reponse = updateNestedObjectParser(obj[key]);
        Object.keys(reponse).forEach((a) => {
          final[`${key}.${a}`] = reponse[a];
        });
      } else {
        final[key] = obj[key];
      }
    }
  });
  return final;
};

const concatUniqueArrays = (arr1 = [], arr2 = []) => {
  return [...new Set([...arr1, ...arr2])];
};
module.exports = {
  getInfoData,
  getSelectData,
  getUnSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectIdMongoDB,
  concatUniqueArrays,
};
