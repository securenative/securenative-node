import EventType from "../enums/event-type";
import { KeyValuePair } from "./key-value-pair";

export type EventOptions = {
  ip: string;
  userAgent: string;
  eventType?: EventType | string;
  remoteIp?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  }
  device?: {};
  params?: Array<KeyValuePair>;
}
