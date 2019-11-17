import IEvent from './event';

export default class RequestEvent implements IEvent {
  ts: number;
  eventType: string;
}