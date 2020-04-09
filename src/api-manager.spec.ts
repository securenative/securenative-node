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

chai.use(chaiAsPromised);
const expect = chai.expect;

const sdkEvent: EventOptions = {
  eventType: EventType.LOG_IN,
  user: {
    id: 'USER_ID',
    name: 'USER_NAME',
    email: 'USER_EMAIL',
  },
  context: {
    ip: '127.0.0.1',
    clientToken: 'SECURED_CLIENT_TOKEN',
    headers: [
      {
        key: 'user-agent',
        value: 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
      },
    ],
  },
  params: [
    {
      key: 'CUSTOM_PARAM',
      value: 'CUSTOM_PARAM_VALUE',
    },
  ],
  timestamp: Date.now(),
};

const delay = (timeout): Promise<void> => new Promise((resolve) => setTimeout(resolve, timeout));

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

    // track async event
    apiManager.track(sdkEvent);

    // ensure event to be sent
    await delay(2 * options.interval);

    const fetchOptions = fetch.lastOptions();
    const eventPayload: SDKEvent = JSON.parse(fetchOptions.body.toString());

    expect(eventPayload).to.be.not.null;
    //timestamp
    expect(eventPayload).to.have.property('ts', sdkEvent.timestamp);
    //event type
    expect(eventPayload).to.have.property('eventType', sdkEvent.eventType);
    //user
    expect(eventPayload).to.have.property('user');
    expect(eventPayload.user).to.have.property('id', sdkEvent.user.id);
    expect(eventPayload.user).to.have.property('name', sdkEvent.user.name);
    expect(eventPayload.user).to.have.property('email', sdkEvent.user.email);
    //params
    const [param] = sdkEvent.params;
    expect(eventPayload).to.have.property('params');
    expect(eventPayload.params).to.have.lengthOf(sdkEvent.params.length, 'Incorrect number of params');
    expect(eventPayload.params.find((p) => p.key == param.key)).to.be.not.null;
    expect(eventPayload.params.find((p) => p.key == param.key).value).to.be.equal(param.value, 'Invalid param value');
    //request context
    expect(eventPayload).to.have.property('request');
    expect(eventPayload.request).to.have.property('ip', sdkEvent.context.ip);
    expect(eventPayload.request).to.have.property('fp', '');
    expect(eventPayload.request).to.have.property('cid', '');
    expect(eventPayload.request).to.have.property('body', '');
    //request headers
    const [header] = sdkEvent.context.headers;
    expect(eventPayload.request).to.have.property('headers');
    expect(eventPayload.request.headers).to.be.lengthOf(sdkEvent.context.headers.length, 'Incorrect headers length');
    expect(eventPayload.request.headers.find((h) => h.key == header.key)).to.be.not.null;
    expect(eventPayload.request.headers.find((h) => h.key == header.key).value).to.be.equal(header.value, 'Invalid header value');
    //response context
    expect(eventPayload).to.have.property('response');

    await eventManager.stopEventsPersist();
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

    // call verify event
    const verifyResult = await apiManager.verify(sdkEvent);
    expect(verifyResult).to.have.property('riskLevel', verifyResponse.riskLevel);
    expect(verifyResult).to.have.property('score', verifyResponse.score);
    expect(verifyResult).to.have.property('triggers').lengthOf(verifyResponse.triggers.length);

    const fetchOptions = fetch.lastOptions();
    const eventPayload: SDKEvent = JSON.parse(fetchOptions.body.toString());

    expect(eventPayload).to.be.not.null;
    //timestamp
    expect(eventPayload).to.have.property('ts', sdkEvent.timestamp);
    //event type
    expect(eventPayload).to.have.property('eventType', sdkEvent.eventType);
    //user
    expect(eventPayload).to.have.property('user');
    expect(eventPayload.user).to.have.property('id', sdkEvent.user.id);
    expect(eventPayload.user).to.have.property('name', sdkEvent.user.name);
    expect(eventPayload.user).to.have.property('email', sdkEvent.user.email);
    //params
    const [param] = sdkEvent.params;
    expect(eventPayload).to.have.property('params');
    expect(eventPayload.params).to.have.lengthOf(sdkEvent.params.length, 'Incorrect number of params');
    expect(eventPayload.params.find((p) => p.key == param.key)).to.be.not.null;
    expect(eventPayload.params.find((p) => p.key == param.key).value).to.be.equal(param.value, 'Invalid param value');
    //request context
    expect(eventPayload).to.have.property('request');
    expect(eventPayload.request).to.have.property('ip', sdkEvent.context.ip);
    expect(eventPayload.request).to.have.property('fp', '');
    expect(eventPayload.request).to.have.property('cid', '');
    expect(eventPayload.request).to.have.property('body', '');
    //request headers
    const [header] = sdkEvent.context.headers;
    expect(eventPayload.request).to.have.property('headers');
    expect(eventPayload.request.headers).to.be.lengthOf(sdkEvent.context.headers.length, 'Incorrect headers length');
    expect(eventPayload.request.headers.find((h) => h.key == header.key)).to.be.not.null;
    expect(eventPayload.request.headers.find((h) => h.key == header.key).value).to.be.equal(header.value, 'Invalid header value');
    //response context
    expect(eventPayload).to.have.property('response');
  });

  it('Should call risk event', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Risk}`, 200);
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    const riskEvent: EventOptions = {
      eventType: EventType.RISK,
    };
    // track async event
    await apiManager.risk(riskEvent);

    const fetchOptions = fetch.lastOptions();
    const eventPayload: SDKEvent = JSON.parse(fetchOptions.body.toString());

    expect(eventPayload).to.be.not.null;
    //timestamp
    expect(eventPayload).to.have.property('ts');
    //event type
    expect(eventPayload).to.have.property('eventType', riskEvent.eventType);
    //user
    expect(eventPayload).to.have.property('user');
    expect(eventPayload.user).to.have.property('id', '');
    expect(eventPayload.user).to.have.property('name', '');
    expect(eventPayload.user).to.have.property('email', '');
    //params
    expect(eventPayload).to.have.property('params');
    expect(eventPayload.params).to.have.lengthOf(0, 'Incorrect number of params');

    //request context
    expect(eventPayload).to.have.property('request');
    expect(eventPayload.request).to.have.property('ip', '');
    expect(eventPayload.request).to.have.property('fp', '');
    expect(eventPayload.request).to.have.property('cid', '');
    expect(eventPayload.request).to.have.property('body', '');
    //request headers
    expect(eventPayload.request).to.have.property('headers');
    expect(eventPayload.request.headers).to.be.lengthOf(0, 'Incorrect headers length');

    //response context
    expect(eventPayload).to.have.property('response');
  });

  it('Should call agent-heart-beat event', async () => {
    const options: SecureNativeOptions = {
      appName: 'YOUR_APP_NAME',
      apiKey: 'YOUR_API_KEY',
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Heartbeat}`, {});
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    // call heartBeat event
    await apiManager.heartBeat();

    const fetchOptions = fetch.lastOptions();
    const eventPayload: AgentHeartBeatEvent = JSON.parse(fetchOptions.body.toString());

    expect(eventPayload).to.be.not.null;
    //timestamp
    expect(eventPayload).to.have.property('ts');
    expect(eventPayload.ts).to.be.greaterThan(0, 'Invalid timestamp');
    //event type
    expect(eventPayload).to.have.property('eventType', EventType.HEART_BEAT);
    //app name
    expect(eventPayload).to.have.property('appName', options.appName);
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
    expect(eventPayload).to.have.property('ts');
    expect(eventPayload.ts).to.be.greaterThan(0, 'Invalid timestamp');
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
  });

  it('Should call agent-logout event', async () => {
    const options: SecureNativeOptions = {
      appName: 'YOUR_APP_NAME',
      apiKey: 'YOUR_API_KEY',
    };

    const fetch = fetchMock.sandbox().mock(`${options.apiUrl}/${ApiRoute.Logout}`, {});
    const eventManager = new EventManager(fetch, options);
    const apiManager = new ApiManager(eventManager, options);

    // call heartBeat event
    const res = await apiManager.agentLogout();
    expect(res).to.be.true;

    const fetchOptions = fetch.lastOptions();
    const eventPayload: AgentLogoutEvent = JSON.parse(fetchOptions.body.toString());

    expect(eventPayload).to.be.not.null;
    //timestamp
    expect(eventPayload).to.have.property('ts');
    expect(eventPayload.ts).to.be.greaterThan(0, 'Invalid timestamp');
    //event type
    expect(eventPayload).to.have.property('eventType', EventType.AGENT_LOG_OUT);
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
    // call heartBeat event
    const res = await apiManager.configurationUpdate(ts);
    expect(res).to.have.property('actions').of.lengthOf(0);
    expect(res).to.have.property('rules').of.lengthOf(0);
    expect(res).to.have.property('ts', fetchRespone.ts);

    const fetchOptions = fetch.lastOptions();
    const eventPayload: AgentLogoutEvent = JSON.parse(fetchOptions.body.toString());

    expect(eventPayload).to.be.not.null;
    //timestamp
    expect(eventPayload).to.have.property('ts');
    expect(eventPayload.ts).to.be.greaterThan(0, 'Invalid timestamp');
    //event type
    expect(eventPayload).to.have.property('eventType', EventType.AGENT_CONFIG);
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

    // track async event
    apiManager.agentError(new Error('Some unexpected error'));

    // ensure event to be sent
    await delay(2 * options.interval);

    const fetchOptions = fetch.lastOptions();
    const eventPayload: SDKEvent = JSON.parse(fetchOptions.body.toString());

    expect(eventPayload).to.be.not.null;
    //timestamp
    expect(eventPayload).to.have.property('ts');
    expect(eventPayload).to.have.property('message', 'Some unexpected error');
    expect(eventPayload).to.have.property('name', 'Error');
    //event type
    expect(eventPayload).to.have.property('eventType', EventType.ERROR);

    await eventManager.stopEventsPersist();
  });
});
