const User = require('../models/user.model');
const emailService = require('./email.service');
const config = require('../config');
const {
  UnauthorizedError,
  BadRequestError,
} = require('../core/error.response');

// Helper function to find a user by email
const findUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError('User not found');
  return user;
};

// Main service functions
const authService = {
  checkMe: async (user) => {
    if (!user) throw new UnauthorizedError('Unauthorized - Invalid User');

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
    };
  },

  signup: async (email, password) => {
    const user = new User({ email });
    const hashedPassword = await user.hashPassword(password);
    user.password = hashedPassword;
    const verificationToken = user.generateResetToken();
    user.resetToken = verificationToken;
    user.resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    await emailService.sendVerificationEmail(email, verificationToken);
    return {
      email: user.email,
      _id: user._id,
    };
  },

  verifyEmail: async (token) => {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) throw new UnauthorizedError('Unauthorized - Invalid Token');

    user.isVerified = true;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    return 'Email verified successfully. You can now log in.';
  },

  login: async (email, password, ipAddress, location = 'Unknown') => {
    const user = await findUserByEmail(email);
    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) throw new UnauthorizedError('Password incorrect');
    if (!user.isVerified) throw new UnauthorizedError('Email not verified');
    if (!user) throw new BadRequestError('User not found');

    const token = user.generateJWT();

    emailService.sendNewDeviceEmail(user.email, ipAddress, location);

    return {
      _id: user._id,
      email: user.email,
      token: token,
      username: user.username,
    };
  },

  validateOTP: async (email, otp) => {
    const user = await findUserByEmail(email);
    if (user.otp !== otp || user.otpExpiry < Date.now())
      throw new BadRequestError('Invalid OTP');

    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    const token = user.generateJWT();
    return { token };
  },

  forgotPassword: async (email, req) => {
    const user = await findUserByEmail(email);
    const resetToken = user.generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();
    await emailService.sendResetEmail(email, resetToken, req);
    return 'Reset link sent to email';
  },

  resetPassword: async (token, password) => {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) throw new BadRequestError('Invalid or expired token');

    const hashedPassword = await user.hashPassword(password);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();
    return 'Password reset successful';
  },
  // Function to send a test email
  sendTestEmail: async () => {
    const mailOptions = {
      from: config.EMAIL_USER,
      to: 'writephudat@gmail.com',
      subject: 'Test Email from Nodemailer',
      text: 'This is a test email to check if Nodemailer is working correctly.',
      html: '<p>This is a test email to check if Nodemailer is working correctly.</p>',
    };
    return await emailService.sendEmail(mailOptions);
  },
  resendVerification: async (email) => {
    const user = await findUserByEmail(email);
    const verificationToken = user.generateResetToken();
    user.resetToken = verificationToken;
    user.resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    await emailService.sendVerificationEmail(email, verificationToken);
    return {
      email: user.email,
      _id: user._id,
    };
  },
};

module.exports = authService;
