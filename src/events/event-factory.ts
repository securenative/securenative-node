import IEvent from './event';
import { EventKind } from '../enums/event-kind';
import SDKEvent from './sdk-event';
import AgentLoginEvent from './agent-login-event';
import AgentLogoutEvent from './agent-logout-event';
import ErrorEvent from './error-event';
import PerformanceEvent from './performance-event';
import RequestEvent from './request-event';
import AgentHeartBeatEvent from './agent-heartbeat-event';
import ConfigEvent from './config-event';

export function createEvent(eventKind: EventKind, ...params: any[]): IEvent {
  if (eventKind === EventKind.AGENT_LOGIN) {
    const [hostId, framework, frameworkVersion, appName] = params;
    return new AgentLoginEvent(hostId, framework, frameworkVersion, appName);
  } else if (eventKind === EventKind.AGENT_LOGOUT) {
    return new AgentLogoutEvent();
  } else if (eventKind === EventKind.HEARTBEAT) {
    const [appName] = params;
    return new AgentHeartBeatEvent(appName);
  } else if (eventKind === EventKind.SDK) {
    const [req, eventOptions, snOptions] = params;
    return new SDKEvent(req, eventOptions, snOptions);
  } else if (eventKind === EventKind.ERROR) {
    const [err] = params;
    return new ErrorEvent(err);
  } else if (eventKind === EventKind.PERFORMANCE) {
    return new PerformanceEvent();
  } else if (eventKind === EventKind.REQUEST) {
    const [reqOptions] = params;
    return new RequestEvent(reqOptions);
  } else if (eventKind === EventKind.CONFIG) {
    const [hostId, appName, ts] = params;
    return new ConfigEvent(hostId, appName, ts);
  }
} 
