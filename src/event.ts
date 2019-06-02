import { KeyValuePair } from "./key-value-pair";

export type Event = {
  eventType: string;
  cid: string;
  vid: string;
  fp: string;
  ip: string;
  remoteIP: string;
  userAgent: string;
  user: {
    id: string
  };
  ts: number;
  device: {

  };
  params?: Array<KeyValuePair>;
}
