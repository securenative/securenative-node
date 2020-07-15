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
import { delay, fromEntries } from './utils/utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

const sdkEvent: EventOptions = {
  event: EventType.LOG_IN,
  userId: 'USER_ID',
  userTraits: {
    name: 'USER_NAME',
    email: 'USER_EMAIL',
    phone: '+123456789',
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
      expect(eventPayload.userTraits).to.have.property('phone', sdkEvent.userTraits.phone);
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
      expect(eventPayload.userTraits).to.have.property('phone', sdkEvent.userTraits.phone);
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
});
