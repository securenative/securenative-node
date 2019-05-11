const uuidv4 = require('uuid/v4');
const utils = require('./utils');

const buildEvent = (req, opts) => {
  const options = opts || {};
  const cookie = utils.cookieIdFromRequest(req, options);
  const cookieDecoded = Buffer.from(cookie, 'base64').toString('utf8');
  const clientFP = JSON.parse(cookieDecoded) || {};

  return {
    cid: clientFP.cid || '',
    vid: uuidv4(),
    fp: clientFP.fp || '',
    ip: options.ip || utils.remoteIpFromRequest(req),
    remoteIP: req.connection.remoteAddress,
    userAgent: options.userAgent || utils.userAgentFromRequest(req),
    user: options.user || {
      id: 'anonymous'
    },
    ts: Date.now(),
    device: options.device || {}
  }
}

module.exports = function () {
  return {
    build: buildEvent
  };
}
