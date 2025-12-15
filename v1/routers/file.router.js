'use strict';
const express = require('express');
const fileController = require('../controllers/file.controller');
const asyncHandler = require('../helpers/asyncHandler');
const router = express.Router();

router.get('/:type', asyncHandler(fileController.getFiles));
router.post('/create', asyncHandler(fileController.addFile));
router.put('/update', asyncHandler(fileController.updateFile));

router.post('/checks', asyncHandler(fileController.checkFiles));
router.post(
  '/create/multiple',
  asyncHandler(fileController.createMultipleFiles)
);
router.put(
  '/update/multiple',
  asyncHandler(fileController.updateMultipleFiles)
);

router.delete('/', asyncHandler(fileController.deleteFileUpdateVideo));
module.exports = router;
