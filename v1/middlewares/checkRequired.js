const { BadRequestError } = require('../core/error.response');
const { updateNestedObjectParser, removeUndefinedObject } = require('../utils');

const checkRequiredNumber = (obj = {}, fields = []) => {
  checkRequired(obj, fields);
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (obj[field] === NaN)
      throw new BadRequestError(`[${field}] must be a number`);
  }
};
const checkRequired = (obj = {}, fields = []) => {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!obj[field]) throw new BadRequestError(`[${field}] missed`);
  }
};
const checkArrayRequired = (obj = {}, fields = []) => {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (!Array.isArray(obj[field]))
      throw new BadRequestError(`[${field}] is not an array`);
  }
};
const remove_id = (obj = {}) => {
  delete obj._id;
  return obj;
};
const checkBody = (obj) => {
  if (!obj) throw new BadRequestError('body is empty');
  return remove_id(obj);
};

const removeUndefinedFields = (obj = {}) =>
  updateNestedObjectParser(removeUndefinedObject(obj));
module.exports = {
  checkRequired,
  checkRequiredNumber,
  checkBody,
  removeUndefinedFields,
  checkArrayRequired,
};
