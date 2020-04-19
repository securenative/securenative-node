import EventType from '../enums/event-type';
import IEvent from './event';

export default class AgentConfigEvent implements IEvent {
  public eventType = EventType.AGENT_CONFIG;
  public hostId: string;
  public appName: string;
  public timestamp: string;
  public ts: number;

  constructor(hostId: string, appName: string, ts: number) {
    this.hostId = hostId;
    this.appName = appName;
    this.timestamp = new Date().toISOString();
    this.ts = ts;
  }
}
