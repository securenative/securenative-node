const cookie = require('cookie');

const remoteIpFromRequest = (req) => {
  if (!req) {
    return '';
  }

  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

const userAgentFromRequest = (req) => {
  if (!req) {
    return '';
  }
  return req.headers['user-agent'];
}

const cookieIdFromRequest = (req, options) => {
  if (!req) {
    return null;
  }
  const cookieName = options.cookieName || "__sn";
  const cookies = cookie.parse(req.headers['cookie'] || '');

  return cookies[cookieName] || null;
}

const buildEvent = (req, opts) => {
  const options = opts || {};
  const session = options.session || {};
  const cookieExpected = options.cookieExpected || false;

  return {
    ip: options.ip || remoteIpFromRequest(req),
    user_agent: options.userAgent || userAgentFromRequest(req),
    user: options.user || {
      id: 'anonymous'
    },
    session: {
      id: session.id || null,
      snCookieId: cookieIdFromRequest(req, options),
      snCookieExpected: session.cookieExpected || cookieExpected
    },
    device: options.device || {}
  }
}

module.exports = function () {
  return {
    build: buildEvent
  };
}
