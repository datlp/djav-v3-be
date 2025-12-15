const { NotFoundError } = require('../core/error.response');

const routerNotFoundHandler = (req, res, next) => {
  throw new NotFoundError('Route not found');
};

module.exports = routerNotFoundHandler;
