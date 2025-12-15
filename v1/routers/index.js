'use strict';
const express = require('express');
const router = express.Router();

router.use('/videos', require('./video.router'));
router.use('/files', require('./file.router'));
router.use('/fshare', require('./fshare.router'));
router.use('/auth', require('./auth.routes'));
router.use('/autocomplete', require('./autocomplete.router'));
router.use('/email', require('./email.routes'));

module.exports = router;
