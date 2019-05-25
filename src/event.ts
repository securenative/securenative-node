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
  },
  ts: number;
  device: {

  }
}
