// middleware/auth.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { UnauthorizedError } = require('../core/error.response');
const asyncHandler = require('../helpers/asyncHandler');
const config = require('../config');

const getUser = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);

    req.user = decoded;
    req.user.userId = new mongoose.Types.ObjectId(decoded.id);
  } else {
    req.user = {};
  }

  next();
});

const isLoggedIn = asyncHandler(async (req, res, next) => {
  if (!req.headers.authorization)
    throw new UnauthorizedError('Not authorized, no token');
  if (!req.headers.authorization.startsWith('Bearer'))
    throw new UnauthorizedError('Not authorized, token is malformed');

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);

    req.user = decoded;
    req.user.userId = new mongoose.Types.ObjectId(decoded.id);
    return next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // handle jwt.verify error
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Not authorized, token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Not authorized, invalid token');
    }
  }
});

const authMiddleware = {
  getUser,
  isLoggedIn,
};

module.exports = authMiddleware;
