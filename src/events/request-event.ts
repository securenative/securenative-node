import IEvent from './event';
import EventTypes from './../event-types';
import { KeyValuePair } from './../key-value-pair';
import { RequestOptions } from './../request-options';

export default class RequestEvent implements IEvent {
  ts: number;
  eventType: string = EventTypes.RISK;
  private url: string;
  private method: string;
  private userAgent: string;
  private headers: Array<KeyValuePair>;
  private body: string;
  private ip: string;
  private remoteIp?: string;
  private fp: string;
  private cid: string;
  private vid: string;

  constructor(opts: RequestOptions) {
    this.url = opts.url;
    this.method = opts.url;
    this.userAgent = opts.userAgent;
    this.headers = opts.headers;
    this.body = opts.body;
    this.ip = opts.ip;
    this.remoteIp = opts.remoteIp;
    this.fp = opts.fp;
    this.cid = opts.cid;
    this.vid = opts.vid;
    this.ts = Date.now();
  }
}
