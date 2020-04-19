import IEvent from './event';
import EventType from './../enums/event-type'

export default class ErrorEvent implements IEvent {
  private name: string;
  private message: string;
  private stackTrace: string;
  eventType: string = EventType.ERROR;
  timestamp: string;

  constructor(err: Error) {
    this.name = err.name;
    this.message = err.message;
    this.stackTrace = err.stack;
    this.timestamp = new Date().toISOString();
  }
}