import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import SecureNative from "./securenative";
import { SecureNativeOptions } from './types/securenative-options';
import ConfigurationManager from './configuration-manager';
import ModuleManager from './module-manager';
import EventType from './enums/event-type';

chai.use(chaiAsPromised);
const expect = chai.expect;
const API_KEY = "DC48C86C04DF0005FB4DE3629AB1F95A922274B0BCACAE326A47DCEA7D6EA6E3";

describe('SecureNative', () => {
  it.only('Should fail creating instance if apikey is missing', () => {
    expect(() => new SecureNative(null, null)).to.throw('You must pass your SecureNative api key');
  });

  it('Should have all methods defined', () => {
    const config = ConfigurationManager.getConfig();
    config.disable = true;
    const moduleManager = new ModuleManager(null);
    const secureNative = new SecureNative(moduleManager, config);

    expect(secureNative).to.have.property('track');
    expect(secureNative).to.have.property('verify');
    expect(secureNative).to.have.property('risk');
    expect(secureNative).to.have.property('flow');
  });

  it('Should send event async', () => {
    const config = ConfigurationManager.getConfig();
    config.autoSend = false;
    const moduleManager = new ModuleManager(null);
    const secureNative = new SecureNative(moduleManager, config);

    secureNative.track({
      eventType: EventType.LOG_IN,
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
      user: {
        id: '12345'
      }
    });

  });

  it('Should return defaut response on failure', async () => {
    const config = ConfigurationManager.getConfig();
    const moduleManager = new ModuleManager(null);
    const secureNative = new SecureNative(moduleManager, config);

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
