import EventTypes from "./event-types";

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
  device?: {}
}
