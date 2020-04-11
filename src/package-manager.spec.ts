import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { PackageManager } from './package-manager';
import { join } from 'path';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('PackageManager', () => {
  it('Should have all methods defined', () => {
    expect(PackageManager).to.have.property('getPackage');
  });

  it('Should return empty when getPackage called on invalid path', () => {
    expect(PackageManager.getPackage('/invalid_path')).to.be.null;
  });

  it('Should parse current package correctly', () => {
    const packagePath = join(__dirname, '../', 'package.json');
    const pkg = PackageManager.getPackage(packagePath);

    expect(pkg).to.be.not.null;
    expect(pkg).to.have.property('name');
    expect(pkg).to.have.property('version');
    expect(pkg).to.have.property('description');
    expect(pkg).to.have.property('dependencies');
    expect(pkg).to.have.property('dependenciesHash');

    expect(pkg.name).to.be.eq('@securenative/sdk');
    expect(pkg.dependencies).to.have.length.above(0);
    expect(pkg.dependencies.find((d) => d.key === 'pino')).to.be.not.null;
  });
});
