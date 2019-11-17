import IEvent from './event';

export default class ErrorEvent implements IEvent {
  eventType: string;
  ts: number;
  message: string;
  stackTrace: string;
}