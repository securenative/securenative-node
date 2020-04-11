import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import HeartBeatManager from './heartbeat-manager';
import sinon from 'sinon';
import { delay } from './utils/utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('HeartBeatManager', () => {
  it('Should have all methods defined', () => {
    const heartBeatManager = new HeartBeatManager(100, null);
    expect(heartBeatManager).to.have.property('startHeartBeatLoop');
    expect(heartBeatManager).to.have.property('stopHeartBeatLoop');
  });

  it('Should start and call hear-beat after interval', async () => {
    const callback = sinon.fake();
    const heartBeatManager = new HeartBeatManager(100, callback);
    heartBeatManager.startHeartBeatLoop();
    try {
      await delay(100);
      expect(callback.called, 'Callback executed').to.be.true;
    } finally {
      heartBeatManager.stopHeartBeatLoop();
    }
  });

  it('Should repeat heart-beat calls', async () => {
    const callback = sinon.fake();
    const heartBeatManager = new HeartBeatManager(50, callback);
    heartBeatManager.startHeartBeatLoop();
    try {
      await delay(100);
      expect(callback.callCount, 'Callback call count').to.be.above(1);
    } finally {
      heartBeatManager.stopHeartBeatLoop();
    }
  });

  it('Should continue heart-beats when exception occures in callback', async () => {
    const obj = {
      method: () => {
        throw new Error('Something happened!');
      },
    };
    const mock = sinon.mock(obj);
    mock.expects('method').twice();
    const heartBeatManager = new HeartBeatManager(50, obj.method);
    heartBeatManager.startHeartBeatLoop();
    try {
      await delay(100);
      mock.verify();
    } finally {
      heartBeatManager.stopHeartBeatLoop();
      mock.restore();
    }
  });
});
