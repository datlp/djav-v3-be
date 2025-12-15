const { BadRequestError } = require('../core/error.response');
const { SuccesResponse } = require('../core/success.response');
const VideoService = require('../services/video.service');
const {
  checkRequired,
  checkBody,
  checkArrayRequired,
} = require('../middlewares/checkRequired');
const { updateNestedObjectParser, removeUndefinedObject } = require('../utils');

class VideoController {
  getVideoList = async (req, res, next) => {
    let { page = 1 } = req.query;
    page = +page;
    if (page === NaN || page < 1)
      throw new BadRequestError(`Invalid page: ${page}`);
    new SuccesResponse({
      message: `Get list videos success`,
      metadata: await VideoService.getVideoList({
        ...req.query,
        page,
      }),
    }).send(res);
  };

  getVideoHistory = async (req, res, next) => {
    let { page = 1 } = req.query;
    const userId = req.user.userId;
    page = +page;
    if (page === NaN || page < 1)
      throw new BadRequestError(`Invalid page: ${page}`);
    new SuccesResponse({
      message: `Get list videos success`,
      metadata: await VideoService.getVideoHistory({
        ...req.query,
        page,
        userId,
      }),
    }).send(res);
  };
  getVideo = async (req, res, next) => {
    checkRequired(req.params, ['video_dvd']);
    const user_id = req.user.userId;
    const { video_dvd } = req.params;
    new SuccesResponse({
      metadata: await VideoService.getVideo({ video_dvd, user_id }),
    }).send(res);
  };

  createVideo = async (req, res, next) => {
    checkRequired(req.body, ['video_dvd']);
    checkBody(req.body);
    const video = updateNestedObjectParser(removeUndefinedObject(req.body));
    new SuccesResponse({
      metadata: await VideoService.createVideo(video),
    }).send(res);
  };
  createVideos = async (req, res, next) => {
    checkArrayRequired(req.body, ['multi']);
    new SuccesResponse({
      metadata: await VideoService.createVideos(
        updateNestedObjectParser(removeUndefinedObject(req.body))
      ),
    }).send(res);
  };
  checkVideos = async (req, res, next) => {
    checkArrayRequired(req.body, ['video_dvds']);
    const video = updateNestedObjectParser(removeUndefinedObject(req.body));
    new SuccesResponse({
      metadata: await VideoService.checkVideos(video),
    }).send(res);
  };

  updateFiles = async (req, res, next) => {
    checkRequired(req.body, ['video_dvd']);
    checkBody(req.body);
    const video = updateNestedObjectParser(removeUndefinedObject(req.body));
    new SuccesResponse({
      metadata: await VideoService.updateFiles(video),
    }).send(res);
  };
  updateVideo = async (req, res, next) => {
    checkRequired(req.body, ['video_dvd']);
    checkBody(req.body);
    const video = updateNestedObjectParser(removeUndefinedObject(req.body));
    new SuccesResponse({
      metadata: await VideoService.updateVideo(video),
    }).send(res);
  };

  voteVideo = async (req, res, next) => {
    checkRequired(req.body, ['video_dvd']);
    checkBody(req.body);
    const video = updateNestedObjectParser(removeUndefinedObject(req.body));
    new SuccesResponse({
      metadata: await VideoService.voteVideo(video),
    }).send(res);
  };

  updateVideos = async (req, res, next) => {
    checkArrayRequired(req.body, ['multi']);
    new SuccesResponse({
      metadata: await VideoService.updateVideos(
        updateNestedObjectParser(removeUndefinedObject(req.body))
      ),
    }).send(res);
  };
}
module.exports = new VideoController();
