import chai from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import SecureNative from './securenative';
import EventTypes from './event-types';
import { SecureNativeOptions } from './securenative-options';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SecureNative', () => {
  it('Should fail creating instance if apikey is missing', () => {
    expect(() => new SecureNative()).to.throw('You must pass your SecureNative api key');
  });

  it('Should have all methods defined', () => {
    const snOptions: SecureNativeOptions = { apiKey: 'SECURENATIVE_API_KEY', autoSend: false };
    const secureNative = new SecureNative(snOptions);
    expect(secureNative).to.have.property('track');
    expect(secureNative).to.have.property('verify');
    expect(secureNative).to.have.property('flow');
  });

  it('Should send event async', () => {
    const snOptions: SecureNativeOptions = { apiKey: 'SECURENATIVE_API_KEY', autoSend: false };
    const secureNative = new SecureNative(snOptions);

    secureNative.track({
      eventType: EventTypes.LOG_IN,
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
      user: {
        id: '12345'
      }
    });

  });

  it('Should return defaut response on failure', async () => {
    const snOptions: SecureNativeOptions = { apiKey: 'SECURENATIVE_API_KEY', autoSend: false };
    const secureNative = new SecureNative(snOptions);

    const res = await secureNative.verify({
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
      user: {
        id: '12345'
      }
    });

    expect(res).to.not.be.null;
    expect(res.action).to.be.equal("allow", 'Wrong bypass action');
    expect(res.riskScore).to.be.equal(0, 'Wrong bypass risk score');
    expect(res.triggers.length).to.be.equal(0, 'Wrong bypass triggers amount');
  });
});
