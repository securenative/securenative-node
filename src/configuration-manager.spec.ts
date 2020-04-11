import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ConfigurationManager from './configuration-manager';
import sinon from 'sinon';
import fs from 'fs';
import { SecureNativeOptions } from './types/securenative-options';
import mockedEnv from 'mocked-env';
import { fromEntries } from './utils/utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ConfigurationManager', () => {
  it('Should parse config file correctly', () => {
    const path = '/dev/null/securenative.json';
    const config = {
      SECURENATIVE_API_KEY: 'SOME_API_KEY',
      SECURENATIVE_APP_NAME: 'SOME_APP_NAME',
      SECURENATIVE_API_URL: 'SOME_API_URL',
      SECURENATIVE_INTERVAL: 1000,
      SECURENATIVE_HEARTBEAT_INTERVAL: 5000,
      SECURENATIVE_MAX_EVENTS: 100,
      SECURENATIVE_TIMEOUT: 1500,
      SECURENATIVE_AUTO_SEND: true,
      SECURENATIVE_DISABLE: false,
      SECURENATIVE_LOG_LEVEL: 'fatal',
      SECURENATIVE_FAILOVER_STRATEGY: 'fail-closed',
    };

    sinon.stub(fs, 'existsSync').withArgs(path).returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path, 'utf-8').returns(JSON.stringify(config));

    const options = ConfigurationManager.readConfigFile(path);
    expect(options).to.not.be.null;
    expect(options).to.have.property('apiKey', 'SOME_API_KEY');
    expect(options).to.have.property('apiUrl', 'SOME_API_URL');
    expect(options).to.have.property('appName', 'SOME_APP_NAME');
    expect(options).to.have.property('autoSend', true);
    expect(options).to.have.property('disable', false);
    expect(options).to.have.property('failoverStrategy', 'fail-closed');
    expect(options).to.have.property('heartBeatInterval', 5000);
    expect(options).to.have.property('interval', 1000);
    expect(options).to.have.property('logLevel', 'fatal');
    expect(options).to.have.property('maxEvents', 100);
    expect(options).to.have.property('timeout', 1500);

    sinon.restore();
  });

  it('Should ignore unknow config file entries', () => {
    const path = '/dev/null/securenative_semi_valid.json';
    const config = {
      SECURENATIVE_UNKNOW_KEY: 'SOME_UNKNOW_KEY',
      SECURENATIVE_TIMEOUT: 1500,
    };

    sinon.stub(fs, 'existsSync').withArgs(path).returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path, 'utf-8').returns(JSON.stringify(config));

    const options = ConfigurationManager.readConfigFile(path);
    expect(options).to.not.be.null;
    expect(options).to.have.property('timeout', 1500);
    expect(Object.entries(options)).to.have.lengthOf(1);

    sinon.restore();
  });

  it('Should not throw when parsing invalid config file', () => {
    const path = '/dev/null/securenative_invalid.json';

    sinon.stub(fs, 'existsSync').withArgs(path).returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path, 'utf-8').returns('{bla bla bla}');

    const options = ConfigurationManager.readConfigFile(path);
    expect(options).to.be.null;

    sinon.restore();
  });

  it('Should ignore invalid config file entries', () => {
    const path = '/dev/null/securenative_invalid.json';
    const config = {
      SECURENATIVE_API_KEY: 1,
      SECURENATIVE_APP_NAME: 2,
      SECURENATIVE_API_URL: 3,
      SECURENATIVE_TIMEOUT: 'bad timeout',
      SECURENATIVE_FAILOVER_STRATEGY: 'fail-what',
    };

    sinon.stub(fs, 'existsSync').withArgs(path).returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path, 'utf-8').returns(JSON.stringify(config));

    const options = ConfigurationManager.readConfigFile(path);
    expect(options).to.not.be.null;
    expect(Object.entries(options), 'Incorrect number of options').to.have.lengthOf(1);
    expect(options).to.have.property('failoverStrategy', config.SECURENATIVE_FAILOVER_STRATEGY);

    sinon.restore();
  });

  it('Should set config properties when config is not null', () => {
    const config: SecureNativeOptions = {
      apiKey: 'SOME_API_KEY',
      appName: 'SOME_APP_NAME',
    };

    //reload config
    ConfigurationManager.loadConfig('some/fake/path');

    Object.entries(config).forEach(([key, val]) => {
      ConfigurationManager.setConfigKey(key, val);

      const newVal = ConfigurationManager.getConfigKey(key);
      expect(newVal, 'Set config param failed').to.be.equal(val);
    });
  });

  it('Should get default config when config file and env variables are missing', () => {
    //reload config
    ConfigurationManager.loadConfig();
    const options = ConfigurationManager.getConfig();
    expect(options).to.not.be.null;
    expect(options).to.have.property('apiKey', null);
    expect(options).to.have.property('apiUrl', 'https://api.securenative.com/collector/api/v1');
    expect(options).to.have.property('appName', '');
    expect(options).to.have.property('autoSend', true);
    expect(options).to.have.property('disable', false);
    expect(options).to.have.property('failoverStrategy', 'fail-open');
    expect(options).to.have.property('heartBeatInterval', 300000);
    expect(options).to.have.property('interval', 1000);
    expect(options).to.have.property('logLevel', 'fatal');
    expect(options).to.have.property('maxEvents', 1000);
    expect(options).to.have.property('minSupportedVersion', '4.9.1');
    expect(options).to.have.property('timeout', 1500);
  });

  it('Should get config via env variables', () => {
    const config = {
      SECURENATIVE_API_KEY: 'SOME_API_KEY',
      SECURENATIVE_APP_NAME: 'SOME_APP_NAME',
      SECURENATIVE_API_URL: 'SOME_API_URL',
      SECURENATIVE_INTERVAL: 1000,
      SECURENATIVE_HEARTBEAT_INTERVAL: 5000,
      SECURENATIVE_MAX_EVENTS: 100,
      SECURENATIVE_TIMEOUT: 1500,
      SECURENATIVE_AUTO_SEND: true,
      SECURENATIVE_DISABLE: false,
      SECURENATIVE_LOG_LEVEL: 'fatal',
      SECURENATIVE_FAILOVER_STRATEGY: 'fail-closed',
    };

    const strConfig = fromEntries(Object.entries(config).map(([key, val]) => [key, val.toString()]));
    const restoreEnv = mockedEnv(strConfig);

    //reload config
    ConfigurationManager.loadConfig();
    // get ccurrent onfig
    const options = ConfigurationManager.getConfig();
    expect(options).to.not.be.null;
    expect(options).to.have.property('apiKey', config.SECURENATIVE_API_KEY);
    expect(options).to.have.property('apiUrl', config.SECURENATIVE_API_URL);
    expect(options).to.have.property('appName', config.SECURENATIVE_APP_NAME);
    expect(options).to.have.property('autoSend', config.SECURENATIVE_AUTO_SEND);
    expect(options).to.have.property('disable', config.SECURENATIVE_DISABLE);
    expect(options).to.have.property('failoverStrategy', config.SECURENATIVE_FAILOVER_STRATEGY);
    expect(options).to.have.property('heartBeatInterval', config.SECURENATIVE_HEARTBEAT_INTERVAL);
    expect(options).to.have.property('interval', config.SECURENATIVE_INTERVAL);
    expect(options).to.have.property('logLevel', config.SECURENATIVE_LOG_LEVEL);
    expect(options).to.have.property('maxEvents', config.SECURENATIVE_MAX_EVENTS);
    expect(options).to.have.property('timeout', config.SECURENATIVE_TIMEOUT);

    restoreEnv();
  });

  it('Should get correct config options', () => {
    const path = '/dev/null/securenative.json';
    const config = {
      SECURENATIVE_API_KEY: 'SOME_API_KEY',
      SECURENATIVE_APP_NAME: 'SOME_APP_NAME',
      SECURENATIVE_API_URL: 'SOME_API_URL',
      SECURENATIVE_INTERVAL: 1000,
      SECURENATIVE_HEARTBEAT_INTERVAL: 5000,
      SECURENATIVE_MAX_EVENTS: 100,
      SECURENATIVE_TIMEOUT: 1500,
      SECURENATIVE_AUTO_SEND: true,
      SECURENATIVE_DISABLE: false,
      SECURENATIVE_LOG_LEVEL: 'fatal',
      SECURENATIVE_FAILOVER_STRATEGY: 'fail-closed',
    };

    sinon.stub(fs, 'existsSync').withArgs(path).returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path, 'utf-8').returns(JSON.stringify(config));

    //update config
    ConfigurationManager.loadConfig(path);

    const options = ConfigurationManager.getConfig();
    expect(options).to.not.be.null;
    expect(options).to.have.property('apiKey', 'SOME_API_KEY');
    expect(options).to.have.property('apiUrl', 'SOME_API_URL');
    expect(options).to.have.property('appName', 'SOME_APP_NAME');
    expect(options).to.have.property('autoSend', true);
    expect(options).to.have.property('disable', false);
    expect(options).to.have.property('failoverStrategy', 'fail-closed');
    expect(options).to.have.property('heartBeatInterval', 5000);
    expect(options).to.have.property('interval', 1000);
    expect(options).to.have.property('logLevel', 'fatal');
    expect(options).to.have.property('maxEvents', 100);
    expect(options).to.have.property('timeout', 1500);

    sinon.restore();
  });

  it('Should overwrite env variables with vales from config file', () => {
    const path = '/dev/null/securenative.json';
    const fileConfig = {
      SECURENATIVE_API_KEY: 'API_KEY_FROM_FILE',
      SECURENATIVE_APP_NAME: 'APP_NAME_FROM_FILE',
      SECURENATIVE_API_URL: 'API_URL_FROM_FILE',
      SECURENATIVE_INTERVAL: 1000,
      SECURENATIVE_HEARTBEAT_INTERVAL: 5000,
      SECURENATIVE_MAX_EVENTS: 100,
      SECURENATIVE_TIMEOUT: 1500,
      SECURENATIVE_AUTO_SEND: false,
      SECURENATIVE_DISABLE: false,
      SECURENATIVE_LOG_LEVEL: 'fatal',
      SECURENATIVE_FAILOVER_STRATEGY: 'fail-closed',
    };

    const envConfig = {
      SECURENATIVE_API_KEY: 'API_KEY_FROM_ENV',
      SECURENATIVE_APP_NAME: 'APP_NAME_ENV',
      SECURENATIVE_API_URL: 'API_URL_ENV',
      SECURENATIVE_INTERVAL: 2000,
      SECURENATIVE_HEARTBEAT_INTERVAL: 10000,
      SECURENATIVE_MAX_EVENTS: 200,
      SECURENATIVE_TIMEOUT: 3000,
      SECURENATIVE_AUTO_SEND: true,
      SECURENATIVE_DISABLE: true,
      SECURENATIVE_LOG_LEVEL: 'error',
      SECURENATIVE_FAILOVER_STRATEGY: 'fail-open',
    };

    const strConfig = fromEntries(Object.entries(envConfig).map(([key, val]) => [key, val.toString()]));
    const restoreEnv = mockedEnv(strConfig);

    sinon.stub(fs, 'existsSync').withArgs(path).returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path, 'utf-8').returns(JSON.stringify(fileConfig));

    //update config
    ConfigurationManager.loadConfig(path);
    //get config
    const options = ConfigurationManager.getConfig();
    expect(options).to.not.be.null;
    expect(options).to.have.property('apiKey', fileConfig.SECURENATIVE_API_KEY);
    expect(options).to.have.property('apiUrl', fileConfig.SECURENATIVE_API_URL);
    expect(options).to.have.property('appName', fileConfig.SECURENATIVE_APP_NAME);
    expect(options).to.have.property('autoSend', fileConfig.SECURENATIVE_AUTO_SEND);
    expect(options).to.have.property('disable', fileConfig.SECURENATIVE_DISABLE);
    expect(options).to.have.property('failoverStrategy', fileConfig.SECURENATIVE_FAILOVER_STRATEGY);
    expect(options).to.have.property('heartBeatInterval', fileConfig.SECURENATIVE_HEARTBEAT_INTERVAL);
    expect(options).to.have.property('interval', fileConfig.SECURENATIVE_INTERVAL);
    expect(options).to.have.property('logLevel', fileConfig.SECURENATIVE_LOG_LEVEL);
    expect(options).to.have.property('maxEvents', fileConfig.SECURENATIVE_MAX_EVENTS);
    expect(options).to.have.property('timeout', fileConfig.SECURENATIVE_TIMEOUT);

    restoreEnv();
    sinon.restore();
  });

  it('Should set defaults for invalid enum properties', () => {
    const path = '/dev/null/securenative.json';
    const fileConfig = {
      SECURENATIVE_FAILOVER_STRATEGY: 'fail-something',
    };

    sinon.stub(fs, 'existsSync').withArgs(path).returns(true);
    sinon.stub(fs, 'readFileSync').withArgs(path, 'utf-8').returns(JSON.stringify(fileConfig));

    //update config
    ConfigurationManager.loadConfig(path);
    //get config
    const options = ConfigurationManager.getConfig();
    expect(options).to.not.be.null;
    expect(options).to.have.property('failoverStrategy', 'fail-open');

    sinon.restore();
  });
});
