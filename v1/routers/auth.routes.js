const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const asyncHandler = require('../helpers/asyncHandler');
const authMiddleware = require('../middlewares/auth.middleware');
const routerNotFoundHandler = require('../middlewares/routerNotFoundHandler.middleware');

router.post('/signup', asyncHandler(authController.signup));
router.get('/verify-email/:token', asyncHandler(authController.verifyEmail));
router.post('/login', asyncHandler(authController.login));
router.post('/validate-otp', asyncHandler(authController.validateOTP));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post(
  '/resend-verification',
  asyncHandler(authController.resendVerification)
);
router.get(
  '/check-me',
  authMiddleware.isLoggedIn,
  asyncHandler(authController.checkMe)
);

router.all('*', routerNotFoundHandler);

module.exports = router;
