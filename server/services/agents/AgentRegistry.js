const logger = require('../../utils/logger');

class AgentRegistry {
  constructor() {
    this.agents = new Map();
  }

  register(agentName, agentInstance) {
    this.agents.set(agentName, agentInstance);
    logger.info(`Registered Agent: ${agentName}`);
  }

  getAgent(agentName) {
    return this.agents.get(agentName) || null;
  }
}

const registry = new AgentRegistry();

// Self-register standard agents
registry.register('SearchAgent', require('./SearchAgent'));
registry.register('AlertAgent', require('./AlertAgent'));

module.exports = registry;
