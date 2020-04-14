import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import InterceptionModule from '../enums/interception-module';
import HttpsServerInterceptor from './https-server-interceptor';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('HttpServerInterceptor', () => {
  it('Should export correct module', () => {
    const interceptor = new HttpsServerInterceptor(null, null, null);
    expect(interceptor.getModule()).to.be.eql(InterceptionModule.Https)
  });
});
