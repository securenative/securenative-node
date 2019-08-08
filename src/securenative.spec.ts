import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import SecureNative from './securenative';
import EventTypes from './event-types';
import { SecureNativeOptions } from './securenative-options';

chai.use(chaiAsPromised);
const expect = chai.expect;
const API_KEY = "DC48C86C04DF0005FB4DE3629AB1F95A922274B0BCACAE326A47DCEA7D6EA6E3";

describe('SecureNative', () => {
  it('Should fail creating instance if apikey is missing', () => {
    expect(() => new SecureNative(null)).to.throw('You must pass your SecureNative api key');
  });

  it('Should have all methods defined', () => {
    const snOptions: SecureNativeOptions = { autoSend: false };
    const secureNative = new SecureNative(API_KEY, snOptions);

    expect(secureNative).to.have.property('track');
    expect(secureNative).to.have.property('verify');
    expect(secureNative).to.have.property('risk');
    expect(secureNative).to.have.property('flow');
  });

  it('Should send event async', () => {
    const snOptions: SecureNativeOptions = { autoSend: false };
    const secureNative = new SecureNative(API_KEY, snOptions);

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
    const snOptions: SecureNativeOptions = { autoSend: false, apiUrl: 'https://localhost' };
    const secureNative = new SecureNative(API_KEY, snOptions);

    const res = await secureNative.verify({
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
      user: {
        id: '12345'
      }
    });

    expect(res).to.not.be.null;
    expect(res.riskLevel).to.be.equal("low", 'Wrong bypass action');
    expect(res.score).to.be.equal(0, 'Wrong bypass risk score');
    expect(res.triggers.length).to.be.equal(0, 'Wrong bypass triggers amount');
  });
});
