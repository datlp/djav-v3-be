const { BadRequestError } = require('../core/error.response');
const { CREATED, SuccesResponse } = require('../core/success.response');
const FshareService = require('../services/fshare.service');

class FshareController {
  login = async (req, res, next) => {
    new SuccesResponse({
      metadata: await FshareService.login(),
    }).send(res);
  };
}
module.exports = new FshareController();
