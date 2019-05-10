const uuidv4 = require('uuid/v4');
const utils = require('./utils');

const buildEvent = (req, opts) => {
  const options = opts || {};
  const session = options.session || {};
  return {
    cid: utils.cookieIdFromRequest(req, options),
    vid: uuidv4(),
    ip: options.ip || utils.remoteIpFromRequest(req),
    remoteIP: req.connection.remoteAddress,
    userAgent: options.userAgent || utils.userAgentFromRequest(req),
    user: options.user || {
      id: 'anonymous'
    },
    device: options.device || {}
  }
}

module.exports = function () {
  return {
    build: buildEvent
  };
}
