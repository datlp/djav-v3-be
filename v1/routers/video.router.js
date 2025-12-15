'use strict';
const express = require('express');
const videoController = require('../controllers/video.controller');
const asyncHandler = require('../helpers/asyncHandler');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/', asyncHandler(videoController.getVideoList));
router.get(
  '/history',
  authMiddleware.getUser,
  asyncHandler(videoController.getVideoHistory)
);
router.get(
  '/detail/:video_dvd',
  authMiddleware.getUser,
  asyncHandler(videoController.getVideo)
);

router.post('/create', asyncHandler(videoController.createVideo));
router.post('/checks', asyncHandler(videoController.checkVideos));
router.post('/create/multiple', asyncHandler(videoController.createVideos));

router.put('/update-files', asyncHandler(videoController.updateFiles));
router.put('/update', asyncHandler(videoController.updateVideo));
router.put('/vote', asyncHandler(videoController.voteVideo));
router.put('/update/multiple', asyncHandler(videoController.updateVideos));

module.exports = router;
