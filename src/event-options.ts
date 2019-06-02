import EventTypes from "./event-types";
import { KeyValuePair } from "./key-value-pair";

export type EventOptions = {
  ip: string;
  userAgent: string;
  eventType?: EventTypes | string;
  remoteIp?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  }
  device?: {};
  params?: Array<KeyValuePair>;
}
