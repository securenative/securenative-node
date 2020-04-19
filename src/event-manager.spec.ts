import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { SecureNativeOptions } from './types/securenative-options';
import fetchMock from 'fetch-mock';
import EventManager from './event-manager';
import IEvent from './events/event';
import { delay } from './utils/utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

const event: IEvent = {
  eventType: 'custom-event',
  timestamp: new Date().toISOString(),
};

describe('EventManager', () => {
  it('Should successfully send async event with status code 200', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, 200);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();

    try {
      // track async event
      eventManager.sendAsync(event, path);

      // ensure event to be sent
      await delay(2 * options.interval);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: IEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp', event.timestamp);
      //event type
      expect(eventPayload).to.have.property('eventType', event.eventType);
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should handle invalid json response with status 200', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, 'bla bla');
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();

    try {
      // track async event
      eventManager.sendAsync(event, path);

      // ensure event to be sent
      await delay(2 * options.interval);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: IEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp', event.timestamp);
      //event type
      expect(eventPayload).to.have.property('eventType', event.eventType);
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should not retry sending async event when status code 200', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, 200);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();

    try {
      // track async event
      eventManager.sendAsync(event, path);

      // ensure event to be sent
      await delay(2 * options.interval);

      expect(fetch.called(), 'first attemp').to.be.true;

      fetch.reset();
      await delay(10 * options.interval);
      expect(fetch.called(), 'second attempt').to.be.false;
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should not retry sending async event when status code 401', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, 401);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();

    try {
      // track async event
      eventManager.sendAsync(event, path);

      // ensure event to be sent
      await delay(2 * options.interval);

      expect(fetch.called(), 'first attemp').to.be.true;

      fetch.reset();
      await delay(10 * options.interval);
      expect(fetch.called(), 'second attempt').to.be.false;
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should retry sending async event when status code 500', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
      autoSend: true,
      interval: 10,
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, 500);
    const eventManager = new EventManager(fetch, options);
    eventManager.startEventsPersist();

    try {
      // track async event
      eventManager.sendAsync(event, path);

      // ensure event to be sent
      await delay(2 * options.interval);

      expect(fetch.called(), 'first failed attemp').to.be.true;

      fetch.reset().post(path, 200);
      await delay(10 * options.interval);
      expect(fetch.called(), 'second failed attempt').to.be.true;
    } finally {
      await eventManager.stopEventsPersist();
      fetch.restore();
    }
  });

  it('Should successfully send sync event with status code 200', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, { data: true });
    const eventManager = new EventManager(fetch, options);

    try {
      // track async event
      const data = await eventManager.sendSync(event, path);
      expect(data).to.have.property('data', true);

      const fetchOptions = fetch.lastOptions();
      const eventPayload: IEvent = JSON.parse(fetchOptions.body.toString());

      expect(eventPayload).to.be.not.null;
      //timestamp
      expect(eventPayload).to.have.property('timestamp', event.timestamp);
      //event type
      expect(eventPayload).to.have.property('eventType', event.eventType);
    } finally {
      fetch.restore();
    }
  });

  it('Should send sync event and handle invalid json response', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, 'bla bla');
    const eventManager = new EventManager(fetch, options);

    try {
      // track async event
      await eventManager.sendSync(event, path);
    } catch (ex) {
      expect(fetch.called()).to.be.true;
      expect(ex).to.have.property('message', 'invalid json response body at /some-path/to-api reason: Unexpected token b in JSON at position 0');
    } finally {
      fetch.restore();
    }
  });

  it('Should send sync event and handle invalid request url', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
    };

    const eventManager = new EventManager(require('node-fetch'), options);
    try {
      // track async event
      await eventManager.sendSync(event, 'path what');
    } catch (ex) {
      expect(ex).to.have.property('message', 'Only absolute URLs are supported');
    }
  });

  it('Should send sync event and fail when status code 401', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, 401);
    const eventManager = new EventManager(fetch, options);

    try {
      // track async event
      await eventManager.sendSync(event, path);
    } catch (ex) {
      expect(fetch.called()).to.be.true;
      expect(ex).to.have.property('message', 'Unauthorized');
    } finally {
      fetch.restore();
    }
  });

  it('Should send sync event and fail when status code 500', async () => {
    const options: SecureNativeOptions = {
      apiKey: 'YOUR_API_KEY',
    };

    const path = 'some-path/to-api';
    const fetch = fetchMock.sandbox().mock(path, 500);
    const eventManager = new EventManager(fetch, options);

    try {
      // track async event
      await eventManager.sendSync(event, path);
    } catch (ex) {
      expect(fetch.called()).to.be.true;
      expect(ex).to.have.property('message', 'Internal Server Error');
    } finally {
      fetch.restore();
    }
  });
});
