import EventTypes from "./event-types";

export type EventOptions = {
  eventType: EventTypes | string;
  ip: string;
  remoteIp?: string;
  userAgent: string;
  user: {
    id: string;
  }
  device?: {}
}
