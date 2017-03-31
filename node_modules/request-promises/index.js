const request = require('request');

module.exports = opts => new Promise((resolve, reject) => {
  request(opts, (err, res) => err ? reject(err) : resolve(res));
});
