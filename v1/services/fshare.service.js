'use strict';

const request = require('request');

class FshareService {
  static async login(video) {
    return await _login();
  }
}

function _login() {
  return new Promise(function (resolve, reject) {
    request(
      {
        headers: {
          'User-Agent': 'djavapp-CW0F5S',
          'Content-Type': 'application/json',
        },
        uri: 'https://api.fshare.vn/api/user/login',
        body: JSON.stringify({
          user_email: 'writephudat@gmail.com',
          password: '2211Dat!',
          app_key: 'dMnqMMZMUnN5YpvKENaEhdQQ5jxDqddt',
        }),
        method: 'POST',
      },
      function (err, res, body) {
        if (err) reject(err);
        resolve(body);
      }
    );
  });
}
module.exports = FshareService;
