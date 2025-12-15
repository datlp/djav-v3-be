// src/controllers/user.controller.js
const { SuccesResponse, CREATED, OK } = require('../core/success.response');
const authService = require('../services/auth.service');

const handleVerifyEmailError = (res, error) =>
  res.status(400).send(error.message);

// Functional controller actions
const checkMe = async (req, res) => {
  const user = req.user;
  const userData = await authService.checkMe(user);

  new SuccesResponse({
    message: 'User data retrieved successfully',
    metadata: userData,
  }).send(res);
};

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.signup(email, password);
  new CREATED({
    message: 'User created. Please check your email to verify your account.',
    metadata: user,
  }).send(res);
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const message = await authService.verifyEmail(token);
    res.send(message);
  } catch (error) {
    handleVerifyEmailError(res, error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // sendNewDeviceEmail
  const ipAddress = req.ip;
  const location = req.headers['user-agent'];
  const data = await authService.login(email, password, ipAddress, location);
  new OK({
    message: 'Login successful',
    metadata: {
      user: {
        _id: data._id,
        email: data.email,
      },
      token: data.token,
    },
  }).send(res);
};
const resendVerification = async (req, res) => {
  const { email } = req.body;
  const user = await authService.resendVerification(email);
  new OK({
    message: 'Verification email sent',
    metadata: { user },
  }).send(res);
};

const validateOTP = async (req, res) => {
  const { email, otp } = req.body;
  const { token } = await authService.validateOTP(email, otp);
  new OK({
    message: 'OTP validation successful',
    metadata: { token },
  }).send(res);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email, req);
  new OK({
    message: 'Reset link sent to email',
    metadata: { resetTokenSent: true },
  }).send(res);
};

const resetPassword = async (req, res) => {
  const { password, token } = req.body;
  await authService.resetPassword(token, password);
  new OK({
    message: 'Password reset successful',
  }).send(res);
};

module.exports = {
  checkMe,
  signup,
  verifyEmail,
  login,
  validateOTP,
  forgotPassword,
  resetPassword,
  resendVerification,
};
