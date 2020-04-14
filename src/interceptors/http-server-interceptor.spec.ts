import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import HttpServerInterceptor from './http-server-interceptor';
import InterceptionModule from '../enums/interception-module';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('HttpServerInterceptor', () => {
  it('Should export correct module', () => {
    const interceptor = new HttpServerInterceptor(null, null, null);
    expect(interceptor.getModule()).to.be.eql(InterceptionModule.Http)
  });
});
