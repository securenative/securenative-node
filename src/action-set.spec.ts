import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ActionSet } from './action-set';
import SetType from './enums/set-type';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ActionSet Tests', () => {
  beforeEach(() => {
    this.actionSet = new ActionSet("ActionTest");
  })

  afterEach(() => {
    this.actionSet.clear();
  });

  it('Should create valid empty ActionSet', () => {
    expect(this.actionSet).to.have.property("add");
    expect(this.actionSet).to.have.property("has");
    expect(this.actionSet).to.have.property("delete");
  });

  it('Should not block invalid ip', () => {
    const ip = "da0352b6df497acd526a44ca0424f4b3";
    this.actionSet.add(SetType.IP, ip);

    expect(this.actionSet.has(SetType.IP, ip)).to.be.false;
  });

  it('Should not block invalid expired ip', () => {
    const ip = "da0352b6df497acd526a44ca0424f4b3";

    this.actionSet.add(SetType.IP, ip, 1583422845, 600);
    expect(this.actionSet.has(SetType.IP, ip)).to.be.false;
  });

  it('Should block ip, user, country forever', () => {
    const ip = "10.0.0.1";
    const user = "DC48C86C04DF0005FB4DE3629AB1F";
    const country = "US";


    this.actionSet.add(SetType.IP, ip);
    this.actionSet.add(SetType.USER, user);
    this.actionSet.add(SetType.COUNTRY, country);

    expect(this.actionSet.has(SetType.IP, ip)).to.be.true;
    expect(this.actionSet.has(SetType.USER, user)).to.be.true;
    expect(this.actionSet.has(SetType.COUNTRY, country)).to.be.true;
  });

  it('Should block ip, user, country for 2 sec', (done) => {
    const ip = "10.0.0.1";
    const user = "DC48C86C04DF0005FB4DE3629AB1F";
    const country = "US";
    const timeout = 2000;

    this.actionSet.add(SetType.IP, ip, Date.now(), timeout / 1000);
    this.actionSet.add(SetType.USER, user, Date.now(), timeout / 1000);
    this.actionSet.add(SetType.COUNTRY, country, Date.now(), timeout / 1000);

    setTimeout(() => {
      expect(this.actionSet.has(SetType.IP, ip)).to.be.false;
      expect(this.actionSet.has(SetType.USER, user)).to.be.false;
      expect(this.actionSet.has(SetType.COUNTRY, country)).to.be.false;
      done();
    }, timeout);
  }).timeout(2100);

  it('Should expire only first ip', (done) => {
    const ip = "10.0.0.1";
    const ip2 = "10.0.0.2";
    const timeout = 2000;

    this.actionSet.add(SetType.IP, ip, Date.now(), 1);
    this.actionSet.add(SetType.IP, ip2, Date.now(), 10);

    setTimeout(() => {
      expect(this.actionSet.has(SetType.IP, ip)).to.be.false;
      expect(this.actionSet.has(SetType.IP, ip2)).to.be.true;
      done();
    }, timeout);
  }).timeout(2100);;

  it('Should expire only first user', (done) => {
    const user = "12345";
    const user2 = "333333";
    const timeout = 2000;

    this.actionSet.add(SetType.USER, user, Date.now(), 1);
    this.actionSet.add(SetType.USER, user2, Date.now(), 10);

    setTimeout(() => {
      expect(this.actionSet.has(SetType.USER, user)).to.be.false;
      expect(this.actionSet.has(SetType.USER, user2)).to.be.true;
      done();
    }, timeout);
  }).timeout(2100);

  it('Should block ip range forever', () => {
    const ipRange = "2.3.4.5/32";
    const validIP = "2.3.4.5";
    const invalidIP = "1.2.3.4";
    this.actionSet.add(SetType.IP, ipRange);

    expect(this.actionSet.has(SetType.IP, validIP)).to.be.true;
    expect(this.actionSet.has(SetType.IP, invalidIP)).to.be.false;
  });

  it('Should ignore invalid ip', () => {
    const badIP = "2.3.45";
    this.actionSet.add(SetType.IP, badIP);

    expect(this.actionSet.has(SetType.IP, badIP)).to.be.false;
  });

  it('Should delete not existing ip, user, country', () => {
    const ip = "10.0.0.1";
    const user = "DC48C86C04DF0005FB4DE3629AB1F";
    const country = "US";

    this.actionSet.delete(SetType.IP, ip);
    this.actionSet.delete(SetType.USER, user);
    this.actionSet.delete(SetType.COUNTRY, country);

    expect(this.actionSet.has(SetType.IP, ip)).to.be.false;
    expect(this.actionSet.has(SetType.USER, user)).to.be.false;
    expect(this.actionSet.has(SetType.COUNTRY, country)).to.be.false;
  });
});
