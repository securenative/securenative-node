import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import SecureNative from './securenative';
import ConfigurationManager from './configuration-manager';
import fetchMock from 'fetch-mock';
import EventManager from './event-manager';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SecureNative', () => {
  it('Should fail to create new instance when params are null', () => {
    expect(() => new SecureNative(null, null)).to.throw('Unable to create SecureNative instance, invalid config provided');
  });

  it('Should have all public methods defined', () => {
    const config = ConfigurationManager.getConfig();
    config.disable = true;
    const fetcher = fetchMock.sandbox().post('*', 200);
    const eventManager = new EventManager(fetcher, config);
    const secureNative = new SecureNative(eventManager, config);

    expect(secureNative).to.have.property('track');
    expect(secureNative).to.have.property('verify');
  });
});
