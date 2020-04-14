import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import SecureNative from './securenative';
import ConfigurationManager from './configuration-manager';
import ModuleManager from './module-manager';
import fetchMock from 'fetch-mock';
import EventManager from './event-manager';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SecureNative', () => {
  it('Should fail to create new instance when params are null', () => {
    expect(() => new SecureNative(null, null, null)).to.throw('Unable to create SecureNative instance, invalid config provided');
  });

  it('Should have all public methods defined', () => {
    const config = ConfigurationManager.getConfig();
    config.disable = true;
    const fetcher = fetchMock.sandbox().post('*', 200);
    const moduleManager = new ModuleManager(null);
    const eventManager = new EventManager(fetcher, config);
    const secureNative = new SecureNative(moduleManager, eventManager, config);

    expect(secureNative).to.have.property('agent');
    expect(secureNative.agent).to.have.property('startAgent');
    expect(secureNative.agent).to.have.property('stopAgent');

    expect(secureNative).to.have.property('sdk');
    expect(secureNative.sdk).to.have.property('track');
    expect(secureNative.sdk).to.have.property('verify');
  });
});
