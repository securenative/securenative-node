const cookie = require('cookie');
const uuidv4 = require('uuid/v4');
const ip = require('ip');

const ipHeaders = ['x-forwarded-for', 'x-client-ip', 'x-real-ip', 'x-forwarded', 'x-cluster-client-ip', 'forwarded-for', 'forwarded', 'via'];

const remoteIpFromRequest = (req) => {
  if (!req) {
    return '';
  }
  let bestCandidate;

  if (req.headers) {
    const headers = req.headers;
    for (let i = 0; i < ipHeaders.length; ++i) {
      const header = headers[ipHeaders[i]] || '';
      console.log(header);
      const list = header.split(',').map((s) => s.trim()).filter(Boolean).filter((x) => ip.isV4Format(x) || ip.isV6Format(x));
      const candidate = list.find((c) => ip.isPublic(c));
      if (candidate !== undefined) {
        return candidate;
      }
      if (bestCandidate === undefined) {
        bestCandidate = list.find((x) => !ip.isLoopback(x));
      }
    }
  }

  let remote = req.connection && req.connection.remoteAddress || '';

  if (!remote || typeof remote !== 'string') {
    return bestCandidate || '';
  }

  var endRemote = remote.split(':').pop();
  if (endRemote && ip.isV4Format(endRemote) && ip.isEqual(remote, endRemote)) {
    remote = endRemote;
  }

  if (req.ip && !ip.isV4Format(remote) && !ip.isV6Format(remote)) { // express case
    return req.ip;
  }

  if (bestCandidate !== undefined && ip.isLoopback(remote)) {
    return bestCandidate;
  }

  return remote;
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
  const cookieName = options.cookieName || "_sn";
  const cookies = cookie.parse(req.headers['cookie'] || '');

  return cookies[cookieName] || null;
}

module.exports = {
  remoteIpFromRequest,
  userAgentFromRequest,
  cookieIdFromRequest
}