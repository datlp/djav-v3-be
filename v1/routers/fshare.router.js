'use strict';
const express = require('express');
const asyncHandler = require('../helpers/asyncHandler.js');
const fshareController = require('../controllers/fshare.controller.js.js');
const router = express.Router();

router.post('/login', asyncHandler(fshareController.login));

module.exports = router;
