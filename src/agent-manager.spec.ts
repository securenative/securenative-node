import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ConfigurationManager from './configuration-manager';
import ModuleManager from './module-manager';
import AgentManager from './agent-manager';
import EventManager from './event-manager';
import fetchMock from 'fetch-mock';
import ApiRoute from './enums/api-route';
import { v4 } from 'uuid';
import ApiManager from './api-manager';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('AgentManager', () => {
  it('Should have all public methods defined', () => {
    const config = { ...ConfigurationManager.getConfig() };
    config.disable = true;
    const moduleManager = new ModuleManager(null);
    const eventManager = new EventManager(null, config);
    const apiManager = new ApiManager(eventManager, config);
    const agentManager = new AgentManager(moduleManager, apiManager, eventManager, config);

    expect(agentManager).to.have.property('startAgent');
    expect(agentManager).to.have.property('stopAgent');
  });

  it('Should fail to start agent without api key', () => {
    const config = {
      apiKey: null,
    };
    const fetcher = fetchMock.sandbox().post('*', 200);
    const moduleManager = new ModuleManager(null);
    const eventManager = new EventManager(fetcher, config);
    const apiManager = new ApiManager(eventManager, config);
    const agentManager = new AgentManager(moduleManager, apiManager, eventManager, config);

    agentManager
      .startAgent()
      .catch((status: Boolean) => expect(status).to.be.false)
      .finally(fetcher.restore);
  });

  it('Should successfully start and stop agent', (done) => {
    const config = { ...ConfigurationManager.getConfig() };

    const fetch = fetchMock
      .sandbox()
      .mock(`${config.apiUrl}/${ApiRoute.Login}`, { sessionId: v4(), config: { actions: [], rules: [], ts: Date.now() } })
      .mock(`${config.apiUrl}/${ApiRoute.Heartbeat}`, {})
      .mock(`${config.apiUrl}/${ApiRoute.Config}`, { actions: [], rules: [], ts: Date.now() })
      .mock(`${config.apiUrl}/${ApiRoute.Logout}`, {});

    config.apiKey = 'YOUR_API_KEY';

    const moduleManager = new ModuleManager(null);
    const eventManager = new EventManager(fetch, config);
    const apiManager = new ApiManager(eventManager, config);
    const agentManager = new AgentManager(moduleManager, apiManager, eventManager, config);

    agentManager
      .startAgent()
      .then((loginStatus: Boolean) => {
        expect(loginStatus).to.be.true;
        return agentManager.stopAgent().then((logoutStatus: Boolean) => {
          expect(logoutStatus).to.be.true;
        });
      })
      .finally(() => {
        fetch.restore();
        done();
      });
  });

  it('Should pevent agent from starting twice', (done) => {
    const config = { ...ConfigurationManager.getConfig() };

    const fetch = fetchMock
      .sandbox()
      .mock(`${config.apiUrl}/${ApiRoute.Login}`, { sessionId: v4(), config: { actions: [], rules: [], ts: Date.now() } })
      .mock(`${config.apiUrl}/${ApiRoute.Heartbeat}`, {})
      .mock(`${config.apiUrl}/${ApiRoute.Config}`, { actions: [], rules: [], ts: Date.now() })
      .mock(`${config.apiUrl}/${ApiRoute.Logout}`, {});

    config.apiKey = 'YOUR_API_KEY';

    const moduleManager = new ModuleManager(null);
    const eventManager = new EventManager(fetch, config);
    const apiManager = new ApiManager(eventManager, config);
    const agentManager = new AgentManager(moduleManager, apiManager, eventManager, config);

    agentManager
      .startAgent()
      .then((loginStatus: Boolean) => {
        expect(loginStatus).to.be.true;

        return agentManager.startAgent().then((secondloginStatus: Boolean) => {
          expect(secondloginStatus).to.be.true;
          return agentManager.stopAgent();
        });
      })
      .finally(() => {
        fetch.restore();
        done();
      });
  });
});
