import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import EventManager from './event-manager';
import fetchMock from 'fetch-mock';
import ApiRoute from './enums/api-route';
import ApiManager from './api-manager';
import EventType from './enums/event-type';
import { EventOptions } from './types/event-options';
import { SecureNativeOptions } from './types/securenative-options';
import SDKEvent from './events/sdk-event';
import VerifyResult from './types/verify-result';
import AgentHeartBeatEvent from './events/agent-heartbeat-event';
import { v4 } from 'uuid';
import ModuleManager from './module-manager';
import AgentLoginEvent from './events/agent-login-event';
import AgentLogoutEvent from './events/agent-logout-event';
import { delay, fromEntries } from './utils/utils';
import RequestEvent from './events/request-event';
import { RequestOptions } from './types/request-options';

chai.use(chaiAsPromised);
const expect = chai.expect;

const sdkEvent: EventOptions = {
  event: EventType.LOG_IN,
  userId: 'USER_ID',
  userTraits: {
    name: 'USER_NAME',
    email: 'USER_EMAIL',
  },
  context: {
    ip: '127.0.0.1',
    clientToken: 'SECURED_CLIENT_TOKEN',
    headers: {
      'user-agent': 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
    },
  },
  properties: {
    prop1: 'CUSTOM_PARAM_VALUE',
    prop2: true,
    prop3: 3,
  },
  timestamp: new Date(),
};

describe('ApiManager', () => {
  it('Should call track event', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Track}`, 200);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();
    const apiManager = new ApiManager(eventManager, options);

    try {
      // track async event
      apiManager.track(sdkEvent);

      // ensure event to be sent
      await delay(2 * options.interval);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: SDKEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp', sdkEvent.timestamp.toISOString());
      //event type
      expect(eventPayload).to.have.property('eventType', sdkEvent.event);
      //user
      expect(eventPayload).to.have.property('userId', sdkEvent.userId);
      expect(eventPayload).to.have.property('userTraits');
      expect(eventPayload.userTraits).to.have.property('name', sdkEvent.userTraits.name);
      expect(eventPayload.userTraits).to.have.property('email', sdkEvent.userTraits.email);
      //properties

      expect(eventPayload).to.have.property('properties');
      expect(Object.keys(eventPayload.properties)).to.have.lengthOf(Object.keys(sdkEvent.properties).length, 'Incorrect number of custom properties');
      Object.entries(eventPayload.properties).forEach(([key, val]) => {
        expect(eventPayload.properties).to.have.property(key, val, 'Invalid param value');
      });
      //request context
      expect(eventPayload).to.have.property('request');
      expect(eventPayload.request).to.have.property('ip', sdkEvent.context.ip);
      expect(eventPayload.request).to.have.property('fp', '');
      expect(eventPayload.request).to.have.property('cid', '');
      //request headers
      expect(eventPayload.request).to.have.property('headers');
      expect(Object.keys(eventPayload.request.headers)).to.be.lengthOf(Object.keys(sdkEvent.context.headers).length, 'Incorrect headers length');

      Object.entries(sdkEvent.context.headers).forEach(([name, value]) => {
        expect(eventPayload.request.headers).to.have.property(name, value, 'Invalid property value');
      });
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should throw when sending more than 10 custom properties to track event', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Track}`, 200);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();
    const apiManager = new ApiManager(eventManager, options);

    const props = fromEntries(Array.from({ length: 11 }, (x, i) => [`prop${i}`, `val${i}`]));

    try {
      // track async event
      apiManager.track({
        event: EventType.LOG_IN,
        properties: props,
      });
    } catch (ex) {
      expect(ex).to.throw;
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should not call track event when automatic persistance disabled', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Track}`, 500);
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    try {
      // track async event
      apiManager.track(sdkEvent);

      // ensure event to be sent
      await delay(2 * options.interval);

      expect(fetch.called()).to.be.false;
    } finally {
      fetch.restore();
    }
  });

  it('Should not retry unauthorized track event call', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Track}`, 401);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();
    const apiManager = new ApiManager(eventManager, options);

    // track async event
    apiManager.track(sdkEvent);

    try {
      // ensure event to be sent
      await delay(2 * options.interval);
      expect(fetch.called(), 'should do first attempt').to.be.true;

      // clear called state
      fetch.resetHistory();

      // ensure event to be again after backoff
      await delay(10 * options.interval);

      expect(fetch.called(), 'Should not retry call').to.be.false;
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should call verify event', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
    };

    const verifyResponse: VerifyResult = {
      riskLevel: 'low',
      score: 0,
      triggers: [],
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Verify}`, verifyResponse);
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    try {
      // call verify event
      const verifyResult = await apiManager.verify(sdkEvent);
      expect(verifyResult).to.have.property('riskLevel', verifyResponse.riskLevel);
      expect(verifyResult).to.have.property('score', verifyResponse.score);
      expect(verifyResult).to.have.property('triggers').lengthOf(verifyResponse.triggers.length);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: SDKEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp', sdkEvent.timestamp.toISOString());
      //event type
      expect(eventPayload).to.have.property('eventType', sdkEvent.event);
      //user
      expect(eventPayload).to.have.property('userId', sdkEvent.userId);
      expect(eventPayload.userTraits).to.have.property('name', sdkEvent.userTraits.name);
      expect(eventPayload.userTraits).to.have.property('email', sdkEvent.userTraits.email);
      //properties
      expect(eventPayload).to.have.property('properties');
      expect(Object.keys(eventPayload.properties)).to.have.lengthOf(Object.keys(sdkEvent.properties).length, 'Incorrect number of custom properties');
      Object.entries(eventPayload.properties).forEach(([key, val]) => {
        expect(eventPayload.properties).to.have.property(key, val, 'Invalid param value');
      });
      //request context
      expect(eventPayload).to.have.property('request');
      expect(eventPayload.request).to.have.property('ip', sdkEvent.context.ip);
      expect(eventPayload.request).to.have.property('fp', '');
      expect(eventPayload.request).to.have.property('cid', '');
      //request headers
      expect(eventPayload.request).to.have.property('headers');
      expect(Object.keys(eventPayload.request.headers)).to.be.lengthOf(Object.keys(sdkEvent.context.headers).length, 'Incorrect headers length');

      Object.entries(sdkEvent.context.headers).forEach(([name, value]) => {
        expect(eventPayload.request.headers).to.have.property(name, value, 'Invalid property value');
      });
    } finally {
      fetch.restore();
    }
  });

  it('Should fail verify event call when unauthorized', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Verify}`, 401);
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    try {
      // call verify event
      const verifyResult = await apiManager.verify(sdkEvent);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: SDKEvent = JSON.parse(fetchOptions.body.toString());
    } finally {
      fetch.restore();
    }
  });

  it('Should call risk event', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Risk}`, 200);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();
    const apiManager = new ApiManager(eventManager, options);

    const riskEvent: RequestOptions = {
      event: EventType.RISK,
      context: {},
    };

    try {
      // track async event
      apiManager.risk(riskEvent);
      
      // ensure event to be sent
      await delay(2 * options.interval);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: RequestEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp');
      //event type
      expect(eventPayload).to.have.property('eventType', riskEvent.event);
      //user
      expect(eventPayload).to.have.property('userId', '');
      expect(eventPayload).to.have.property('userTraits');
      expect(eventPayload.userTraits).to.have.property('name', '');
      expect(eventPayload.userTraits).to.have.property('email', '');

      //request context
      expect(eventPayload).to.have.property('request');
      expect(eventPayload.request).to.have.property('ip', '');
      expect(eventPayload.request).to.have.property('fp', '');
      expect(eventPayload.request).to.have.property('cid', '');
      //request headers
      expect(eventPayload.request).to.have.property('headers');
      expect(Object.keys(eventPayload.request.headers)).to.be.lengthOf(0, 'Incorrect headers length');

      //response context
      expect(eventPayload).to.have.property('response');
      expect(eventPayload.response).to.have.property('headers');
      expect(eventPayload.response).to.have.property('status');
    } finally {
      eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should call agent-heart-beat event', async () => {
    const options: SecureNativeOptions = {
      appName: 'YOUR_APP_NAME',
      apiKey: 'YOUR_API_KEY',
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Heartbeat}`, {});
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    try {
      // call heartBeat event
      await apiManager.heartBeat();

      const fetchOptions = fetch.lastOptions();
      const eventPayload: AgentHeartBeatEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp');
      expect(eventPayload.timestamp).to.be.not.empty;
      //event type
      expect(eventPayload).to.have.property('eventType', EventType.HEART_BEAT);
      //app name
      expect(eventPayload).to.have.property('appName', options.appName);
    } finally {
      fetch.restore();
    }
  });

  it('Should call agent-login event', async () => {
    const options: SecureNativeOptions = {
      appName: 'YOUR_APP_NAME',
      apiKey: 'YOUR_API_KEY',
    };

    const fetchRespone = { sessionId: v4(), config: { actions: [], rules: [], ts: Date.now() } };
    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Login}`, fetchRespone);
    const moduleManager = new ModuleManager(null);
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    try {
      // call heartBeat event
      const res = await apiManager.agentLogin(moduleManager);
      expect(res).to.have.property('config');
      expect(res.config).to.have.property('actions').of.lengthOf(0);
      expect(res.config).to.have.property('rules').of.lengthOf(0);
      expect(res.config).to.have.property('ts', fetchRespone.config.ts);
      expect(res).to.have.property('sessionId', fetchRespone.sessionId);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: AgentLoginEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp');
      expect(eventPayload.timestamp).to.be.not.empty;
      //event type
      expect(eventPayload).to.have.property('eventType', EventType.AGENT_LOG_IN);
      //app name
      expect(eventPayload).to.have.property('appName', options.appName);
      // ensure properties
      expect(eventPayload).to.have.property('agent');
      expect(eventPayload).to.have.property('framework');
      expect(eventPayload).to.have.property('os');
      expect(eventPayload).to.have.property('package');
      expect(eventPayload).to.have.property('process');
      expect(eventPayload).to.have.property('runtime');
      expect(eventPayload.runtime).to.have.property('type', 'node.js');
    } finally {
      fetch.restore();
    }
  });

  it('Should call agent-logout event', async () => {
    const options: SecureNativeOptions = {
      appName: 'YOUR_APP_NAME',
      apiKey: 'YOUR_API_KEY',
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Logout}`, {});
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    try {
      // call heartBeat event
      const res = await apiManager.agentLogout();
      expect(res).to.be.true;

      const fetchOptions = fetch.lastOptions();
      const eventPayload: AgentLogoutEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp');
      expect(eventPayload.timestamp).to.be.not.empty;
      //event type
      expect(eventPayload).to.have.property('eventType', EventType.AGENT_LOG_OUT);
    } finally {
      fetch.restore();
    }
  });

  it('Should call agent-configuration-update event', async () => {
    const options: SecureNativeOptions = {
      appName: 'YOUR_APP_NAME',
      apiKey: 'YOUR_API_KEY',
      timeout: 50,
    };

    const fetchRespone = { actions: [], rules: [], ts: Date.now() };
    // set delay greater than timeout
    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Config}`, fetchRespone, { delay: 100 });
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    const ts = Date.now();

    try {
      // call heartBeat event
      const res = await apiManager.configurationUpdate(ts);
      expect(res).to.have.property('actions').of.lengthOf(0);
      expect(res).to.have.property('rules').of.lengthOf(0);
      expect(res).to.have.property('ts', fetchRespone.ts);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: AgentLogoutEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp');
      expect(eventPayload.timestamp).to.be.not.empty;
      //event type
      expect(eventPayload).to.have.property('eventType', EventType.AGENT_CONFIG);
    } finally {
      fetch.restore();
    }
  });

  it('Should call agent-error event', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Error}`, 200);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();
    const apiManager = new ApiManager(eventManager, options);

    try {
      // track async event
      apiManager.agentError(new Error('Some unexpected error'));

      // ensure event to be sent
      await delay(2 * options.interval);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: SDKEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp');
      expect(eventPayload).to.have.property('message', 'Some unexpected error');
      expect(eventPayload).to.have.property('name', 'Error');
      //event type
      expect(eventPayload).to.have.property('eventType', EventType.ERROR);
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });
});
