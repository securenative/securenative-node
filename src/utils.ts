import { Request } from 'express'
import { parse } from 'cookie';
import { isV4Format, isV6Format, isPublic, isLoopback, isEqual } from 'ip';

const ipHeaders = ['x-forwarded-for', 'x-client-ip', 'x-real-ip', 'x-forwarded', 'x-cluster-client-ip', 'forwarded-for', 'forwarded', 'via'];

const clientIpFromRequest = (req: Request) => {
  if (!req) {
    return '';
  }
  let bestCandidate;

  if (req.headers) {
    const headers = req.headers;
    for (let i = 0; i < ipHeaders.length; ++i) {
      const header = headers[ipHeaders[i]] || '';
      if (typeof header === "string") {
        const list = header.split(',').map((s) => s.trim()).filter(Boolean).filter((x) => isV4Format(x) || isV6Format(x));
        const candidate = list.find((c) => isPublic(c));
        if (candidate !== undefined) {
          return candidate;
        }
        if (bestCandidate === undefined) {
          bestCandidate = list.find((x) => !isLoopback(x));
        }
      }
    }
  }

  let remote = req.connection && req.connection.remoteAddress || '';

  if (!remote || typeof remote !== 'string') {
    return bestCandidate || '';
  }

  let endRemote = remote.split(':').pop();
  if (endRemote && isV4Format(endRemote) && isEqual(remote, endRemote)) {
    remote = endRemote;
  }

  if (req.ip && !isV4Format(remote) && !isV6Format(remote)) { // express case
    return req.ip;
  }

  if (bestCandidate !== undefined && isLoopback(remote)) {
    return bestCandidate;
  }

  return remote;
}

const remoteIpFromRequest = (req: Request) => {
  if (req && req.connection) {
    return req.connection.remoteAddress;
  }
  return '';
}

const userAgentFromRequest = (req: Request) => {
  if (!req) {
    return '';
  }
  return req.headers['user-agent'];
}

const cookieIdFromRequest = (req: Request, options) => {
  if (!req) {
    return null;
  }
  const cookieName = options.cookieName || "_sn";
  const cookies = parse(req.headers['cookie'] || '');

  return cookies[cookieName] || null;
}

const promiseTimeout = (promise, ms) => {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timed out in ' + ms + 'ms.')
    }, ms)
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ]);
}

export {
  clientIpFromRequest,
  remoteIpFromRequest,
  userAgentFromRequest,
  cookieIdFromRequest,
  promiseTimeout
}
