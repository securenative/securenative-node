import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ModuleManager from './module-manager';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ModuleManager', () => {
  it('Should have all methods defined', () => {
    const moduleManager = new ModuleManager(null);
    expect(moduleManager.Modules).to.not.be.null;
    expect(Object.keys(moduleManager.Modules), 'Loaded modules').length.above(0);
    expect(moduleManager.pkg).to.be.null;
    expect(moduleManager.framework).to.be.undefined;
  });
});
