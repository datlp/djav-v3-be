const { BadRequestError } = require('../core/error.response');
const { SuccesResponse } = require('../core/success.response');
const FileService = require('../services/file.service');
const {
  checkRequired,
  checkBody,
  removeUndefinedFields,
  checkArrayRequired,
} = require('../middlewares/checkRequired');

class FileController {
  addFile = async (req, res, next) => {
    checkBody(req.body);
    checkRequired(req.body, ['file_code', 'video_dvd', 'video_id']);

    new SuccesResponse({
      metadata: await FileService.addFile(removeUndefinedFields(req.body)),
    }).send(res);
  };
  updateFile = async (req, res, next) => {
    checkBody(req.body);
    checkRequired(req.body, ['file_code']);

    new SuccesResponse({
      metadata: await FileService.updateFile(removeUndefinedFields(req.body)),
    }).send(res);
  };
  checkFiles = async (req, res, next) => {
    checkArrayRequired(req.body, ['file_codes']);
    new SuccesResponse({
      metadata: await FileService.checkFiles(removeUndefinedFields(req.body)),
    }).send(res);
  };
  createMultipleFiles = async (req, res, next) => {
    checkArrayRequired(req.body, ['multi']);
    new SuccesResponse({
      metadata: await FileService.createMultipleFiles(
        removeUndefinedFields(req.body)
      ),
    }).send(res);
  };
  updateMultipleFiles = async (req, res, next) => {
    checkArrayRequired(req.body, ['multi']);
    new SuccesResponse({
      metadata: await FileService.updateMultipleFiles(
        removeUndefinedFields(req.body)
      ),
    }).send(res);
  };
  getFiles = async (req, res, next) => {
    const { type } = req.params;
    let { page = 1 } = req.query;
    page = +page;
    if (page === NaN || page < 1)
      throw new BadRequestError(`Invalid page: ${page}`);
    new SuccesResponse({
      message: `Get list of ${type} videos success`,
      metadata: await FileService.getFiles({
        ...req.query,
        type,
        page,
      }),
    }).send(res);
  };
  deleteFileUpdateVideo = async (req, res, next) => {
    checkBody(req.body);
    checkRequired(req.body, ['file_code', 'file_deleteReason']);

    new SuccesResponse({
      metadata: await FileService.deleteFileUpdateVideo(req.body),
    }).send(res);
  };
}
module.exports = new FileController();
