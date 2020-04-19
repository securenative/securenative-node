import IEvent from "./event";

export default class PerformanceEvent implements IEvent {
  eventType: string;
  timestamp: string;
}