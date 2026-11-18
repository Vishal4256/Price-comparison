const AgentRegistry = require('../agents/AgentRegistry');
const logger = require('../../utils/logger');

class WorkflowEngine {
  /**
   * Executes the generated plan step by step
   */
  async executePlan(plan, conversationContext, userQuery) {
    let currentContext = { ...conversationContext, query: userQuery };
    let finalResponse = { content: '', structuredData: {} };

    for (const step of plan.plan) {
      logger.info(`Executing step ${step.step}: ${step.agent}`);
      const agent = AgentRegistry.getAgent(step.agent);
      
      if (!agent) {
        logger.warn(`Agent ${step.agent} not found in registry.`);
        continue;
      }

      const result = await agent.execute(currentContext);
      
      // Merge results into context for the next step
      currentContext = { ...currentContext, ...result.contextUpdates };
      
      // Update final response
      if (result.content) {
        finalResponse.content += `${result.content}\n`;
      }
      if (result.structuredData) {
        finalResponse.structuredData = { ...finalResponse.structuredData, ...result.structuredData };
      }
    }

    return finalResponse;
  }
}

module.exports = new WorkflowEngine();
