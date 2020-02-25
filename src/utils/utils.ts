import { parse } from 'cookie';
import { isV4Format, isV6Format, isPublic, isLoopback, isEqual } from 'ip';
import { createDecipheriv, randomBytes, createCipheriv } from 'crypto';
import { createHash } from 'crypto';
import { KeyValuePair } from '../types/key-value-pair';
import { Logger } from '../logger';

const ALGORITHM = 'aes-256-cbc';
const BLOCK_SIZE = 16;
const AES_KEY_SIZE = 32;
const ipHeaders = ['x-forwarded-for', 'x-client-ip', 'x-real-ip', 'x-forwarded', 'x-cluster-client-ip', 'forwarded-for', 'forwarded', 'via'];

const clientIpFromRequest = (req: any) => {
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

const remoteIpFromRequest = (req: any) => {
  if (req && req.connection) {
    return req.connection.remoteAddress;
  }
  return '';
}

const userAgentFromRequest = (req: any) => {
  if (!req) {
    return '';
  }
  return req.headers['user-agent'];
}

const headersFromRequest = (req: any): Array<KeyValuePair> => Object.entries(req.headers).map(([key, val]) => {
  const value = (Array.isArray(val)) ? val.join(",") : val.toString()
  return { key, value: encodeURI(value) }
});


const cookieIdFromRequest = (req: any, options) => {
  if (!req) {
    return null;
  }
  const cookieName = options.cookieName || "_sn";
  const cookies = parse(req.headers['cookie'] || '');

  return cookies[cookieName] || null;
}

const secureheaderFromRequest = (req: any) => {
  if (!req) {
    return null;
  }
  const secHeader = req.headers['x-securenative'] || '';
  return secHeader.toString() || null;
}

const getDeviceFp = (req, options) => {
  const cookie = cookieIdFromRequest(req, options) || secureheaderFromRequest(req) || '{}';
  const cookieDecoded = decrypt(cookie, options.apiKey);
  const clientFP = JSON.parse(cookieDecoded) || {};
  return clientFP.fp || '';
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

function trimKey(key: string): string {
  return key.substring(0, AES_KEY_SIZE);
}

// Decrypts cipher text into plain text
function decrypt(cipherText: string, cipherKey: string) {
  try {
    const contents = Buffer.from(cipherText, 'hex');
    const iv = contents.slice(0, BLOCK_SIZE);
    const textBytes: any = contents.slice(BLOCK_SIZE);

    const decipher = createDecipheriv(ALGORITHM, trimKey(cipherKey), iv);
    let decrypted = decipher.update(textBytes, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (ex) {
    // log error
  }

  return null;
}

// Encrypts plain text into cipher text
function encrypt(plainText, cipherKey: string) {
  const iv = randomBytes(BLOCK_SIZE);
  const cipher = createCipheriv(ALGORITHM, trimKey(cipherKey), iv);
  let cipherText;
  try {
    cipherText = cipher.update(plainText, 'utf8', 'hex');
    cipherText += cipher.final('hex');
    cipherText = iv.toString('hex') + cipherText
  } catch (e) {
    cipherText = null;
  }
  return cipherText;
}

// compare node versions
function compareVersions(v1: string, v2: string) {
  let v1parts: Array<any> = v1.replace('v', '').split('.');
  let v2parts: Array<any> = v2.replace('v', '').split('.');
  const k = Math.min(v1.length, v2.length);
  for (let i = 0; i < k; ++i) {
    v1parts[i] = parseInt(v1[i], 10);
    v2parts[i] = parseInt(v2[i], 10);
    if (v1[i] > v2[i]) return 1;
    if (v1[i] < v2[i]) return -1;
  }
  return v1.length == v2.length ? 0 : (v1.length < v2.length ? -1 : 1);
}

function toNumber(str, defaultValue: number) {
  return parseInt(str) || defaultValue;
}

function toBoolean(str, defaultValue: boolean) {
  return (str === "true" || str === "1" || str === "false" || str === "0") ? Boolean(str) : defaultValue;
}

function calculateHash(str: string): string {
  return createHash('sha256').update(str).digest('hex');
}

const isModuleExists = (path) => {
  try {
    require.resolve(path);
    return true;
  } catch (e) {
    return false;
  }
}


export {
  clientIpFromRequest,
  remoteIpFromRequest,
  userAgentFromRequest,
  headersFromRequest,
  cookieIdFromRequest,
  secureheaderFromRequest,
  getDeviceFp,
  promiseTimeout,
  compareVersions,
  encrypt,
  decrypt,
  toNumber,
  toBoolean,
  calculateHash,
  isModuleExists
}
