import { KeyValuePair } from "./key-value-pair";

export type RequestOptions = {
  url: string;
  method: string;
  userAgent: string;
  headers: Array<KeyValuePair>;
  body: string;
  ip: string;
  remoteIp?: string;
  fp: string;
  cid: string;
  vid: string;
}
