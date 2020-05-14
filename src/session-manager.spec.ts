import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import SessionManager from './session-manager';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('SessionManager', () => {
  beforeEach(() => {
    SessionManager.cleanAllSessions();
  });

  it('Should have all public methods defined', () => {
    expect(SessionManager).to.have.property('getLastSession');
    expect(SessionManager).to.have.property('getSession');
    expect(SessionManager).to.have.property('setSession');
    expect(SessionManager).to.have.property('cleanSession');
    expect(SessionManager).to.have.property('cleanAllSessions');  
  });

  it('Should set and get sesssion', () => {
    const id = '1234';
    SessionManager.setSession(id, { req: {}, res: {} });
    const session = SessionManager.getSession(id);

    expect(session).to.have.property('req').eql({ sn_uid: '1234' });
    expect(session).to.have.property('res').eql({ sn_uid: '1234' });
  });

  it('Should set and clean all sesssions', () => {
    const sessions = ['1111', '2222', '3333', '4444'];
    sessions.forEach((id) => {
      SessionManager.setSession(id, { req: {}, res: {} });
    });

    sessions.forEach((id) => {
      SessionManager.cleanSession(id);
    });

    sessions.forEach((id) => {
      const session = SessionManager.getSession(id);
      expect(session).to.be.eql({ req: null, res: null });
    });
  });

  it('Should set multiple sessions and get latest session', () => {
    const sessions = ['1111', '2222', '3333', '4444'];
    const [last] = sessions;

    sessions.forEach((id) => {
      SessionManager.setSession(id, { req: {}, res: {} });
    });

    const session = SessionManager.getLastSession();
    expect(session).to.have.property('req').eql({ sn_uid: last });
    expect(session).to.have.property('res').eql({ sn_uid: last });
  });
});
