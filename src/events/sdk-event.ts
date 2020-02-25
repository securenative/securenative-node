import IEvent from "./event";
import { KeyValuePair } from "../types/key-value-pair";
import { EventOptions } from "../types/event-options";
import { cookieIdFromRequest, secureheaderFromRequest, decrypt, clientIpFromRequest, remoteIpFromRequest, userAgentFromRequest } from "../utils/utils";
import { Logger } from "../logger";
import { v4 } from "uuid";
import EventType from "../enums/event-type";
import { SecureNativeOptions } from "../types/securenative-options";

export default class SDKEvent implements IEvent {
  public eventType: string;
  public cid: string;
  public vid: string;
  public fp: string;
  public ip: string;
  public remoteIP: string;
  public userAgent: string;
  public user: {
    id: string
  };
  public ts: number;
  public device: {};
  public params?: Array<KeyValuePair>;

  constructor(req: any, opts: EventOptions, options: SecureNativeOptions) {
    Logger.debug("Building new SDK event");
    const cookie = cookieIdFromRequest(req, options) || secureheaderFromRequest(req) || '{}';
    Logger.debug("Cookie from request", cookie);
    const cookieDecoded = decrypt(cookie, options.apiKey);
    Logger.debug("Cookie decoded", cookieDecoded);
    const clientFP = JSON.parse(cookieDecoded) || {};
    Logger.debug("Extracted user FP:", clientFP);
    this.eventType = opts.eventType || EventType.LOG_IN;
    this.cid = clientFP.cid || '';
    this.vid = v4();
    this.fp = clientFP.fp || '';
    this.ip = opts.ip || clientIpFromRequest(req);
    this.remoteIP = opts.remoteIp || remoteIpFromRequest(req);
    this.userAgent = opts.userAgent || userAgentFromRequest(req);
    this.user = opts.user || {
      id: 'anonymous'
    };
    this.ts = Date.now();
    this.device = opts.device || {};
    this.params = opts.params;
  }
}
