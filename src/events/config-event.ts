import EventType from '../enums/event-type';
import IEvent from './event';

export default class ConfigEvent implements IEvent {
  public eventType = EventType.AGENT_CONFIG;
  public ts: number;

  constructor() {
    this.ts = Date.now();
  }
}
