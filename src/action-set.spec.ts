import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ActionSet, SetType } from './action-set';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SecureNative', () => {
  it('Should create valid empty ActionSet', () => {
    const actionSet = new ActionSet("ActionTest");
    expect(actionSet).to.have.property("add");
    expect(actionSet).to.have.property("has");
    expect(actionSet).to.have.property("delete");
  });

  it('Should block ip, user, country forever', () => {
    const ip = "10.0.0.1";
    const user = "DC48C86C04DF0005FB4DE3629AB1F";
    const country = "US";

    const actionSet = new ActionSet("ActionTest");
    actionSet.add(SetType.IP, ip);
    actionSet.add(SetType.USER, user);
    actionSet.add(SetType.COUNTRY, country);

    expect(actionSet.has(SetType.IP, ip)).to.be.true;
    expect(actionSet.has(SetType.USER, user)).to.be.true;
    expect(actionSet.has(SetType.COUNTRY, country)).to.be.true;
  });

  it('Should block ip, user, country for 2 sec', function (done) {
    const ip = "10.0.0.1";
    const user = "DC48C86C04DF0005FB4DE3629AB1F";
    const country = "US";
    const timeout = 2000;

    // set test timeout
    this.timeout(timeout + 100);

    const actionSet = new ActionSet("ActionTest");
    actionSet.add(SetType.IP, ip, timeout);
    actionSet.add(SetType.USER, user, timeout);
    actionSet.add(SetType.COUNTRY, country, timeout);

    setTimeout(function () {
      expect(actionSet.has(SetType.IP, ip)).to.be.false;
      expect(actionSet.has(SetType.USER, user)).to.be.false;
      expect(actionSet.has(SetType.COUNTRY, country)).to.be.false;
      done();
    }, timeout);
  });

  it('Should expire only first ip', function (done) {
    const ip = "10.0.0.1";
    const ip2 = "10.0.0.2";
    const timeout = 2000;

    // set test timeout
    this.timeout(timeout + 100);

    const actionSet = new ActionSet("ActionTest");
    actionSet.add(SetType.IP, ip, 1000);
    actionSet.add(SetType.IP, ip2, 10000);

    setTimeout(function () {
      expect(actionSet.has(SetType.IP, ip)).to.be.false;
      expect(actionSet.has(SetType.IP, ip2)).to.be.true;
      done();
    }, timeout);
  });

  it('Should expire only first user', function (done) {
    const user = "12345";
    const user2 = "333333";
    const timeout = 2000;

    // set test timeout
    this.timeout(timeout + 100);

    const actionSet = new ActionSet("ActionTest");
    actionSet.add(SetType.USER, user, 1000);
    actionSet.add(SetType.USER, user2, 10000);

    setTimeout(function () {
      expect(actionSet.has(SetType.USER, user)).to.be.false;
      expect(actionSet.has(SetType.USER, user2)).to.be.true;
      done();
    }, timeout);
  });

  it('Should block ip range forever', () => {
    const ipRange = "2.3.4.5/32";
    const validIP = "2.3.4.5";
    const invalidIP = "1.2.3.4";

    const actionSet = new ActionSet("ActionTest");
    actionSet.add(SetType.IP, ipRange);

    expect(actionSet.has(SetType.IP, validIP)).to.be.true;
    expect(actionSet.has(SetType.IP, invalidIP)).to.be.false;
  });

  it('Should ignore invalid ip', () => {
    const badIP = "2.3.45";

    const actionSet = new ActionSet("ActionTest");
    actionSet.add(SetType.IP, badIP);

    expect(actionSet.has(SetType.IP, badIP)).to.be.false;
  });

  it('Should delete not existing ip, user, country', () => {
    const ip = "10.0.0.1";
    const user = "DC48C86C04DF0005FB4DE3629AB1F";
    const country = "US";

    const actionSet = new ActionSet("ActionTest");
    actionSet.delete(SetType.IP, ip);
    actionSet.delete(SetType.USER, user);
    actionSet.delete(SetType.COUNTRY, country);

    expect(actionSet.has(SetType.IP, ip)).to.be.false;
    expect(actionSet.has(SetType.USER, user)).to.be.false;
    expect(actionSet.has(SetType.COUNTRY, country)).to.be.false;
  });
});
