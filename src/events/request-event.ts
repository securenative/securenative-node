import IEvent from './event';
import { decrypt } from '../utils/utils';
import { Logger } from '../logger';
import { v4 } from 'uuid';
import { SecureNativeOptions } from '../types/securenative-options';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http2';
import { RequestOptions } from '../types/request-options';

export default class RequestEvent implements IEvent {
  public rid: string;
  public eventType: string;
  public userId: string;
  public userTraits: {
    name: string;
    email: string;
    createdAt: string;
  };
  public request: {
    cid: string;
    vid: string;
    fp: string;
    ip: string;
    remoteIp: string;
    headers: IncomingHttpHeaders;
    url: string;
    method: string;
    body: Object;
  };
  public response: {
    status: number;
    headers: OutgoingHttpHeaders;
  };
  public timestamp: string;

  constructor(event: RequestOptions, options: SecureNativeOptions) {
    Logger.debug('Building request event');
    const reqContext = event.context?.req || {};
    const resContext = event.context?.res || {};
    const decryptedToken = decrypt(reqContext?.clientToken, options.apiKey);
    Logger.debug('Decrypted client token', decryptedToken);
    const parsedToken = JSON.parse(decryptedToken) || {};
    Logger.debug('Parsed client token:', parsedToken);

    const user: any = {};

    this.rid = v4();
    this.eventType = event.event;
    this.userId = user.userId || '';
    this.userTraits = {
      name: user.name || '',
      email: user.email || '',
      createdAt: user.createdAt?.toISOString() || new Date(0).toISOString(),
    };

    this.request = {
      cid: parsedToken.cid || '',
      vid: parsedToken.vid || '',
      fp: parsedToken.fp || '',
      ip: reqContext.ip || '',
      remoteIp: reqContext.remoteIp || '',
      method: reqContext.method || '',
      url: reqContext.url,
      body: reqContext.body || '',
      headers: reqContext.headers || {},
    };

    this.response = {
      status: resContext.status || 0,
      headers: resContext.headers || {},
    };

    this.timestamp = event.timestamp?.toISOString() || new Date().toISOString();
  }
}
