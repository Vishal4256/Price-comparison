const ConversationMemory = require('./ConversationMemory');
const ConversationService = require('./ConversationService');
const Planner = require('./Planner');
const WorkflowEngine = require('./WorkflowEngine');
const logger = require('../../utils/logger');

class ShoppingAssistant {
  /**
   * Process an incoming message from the user
   */
  async processMessage(userId, sessionId, content, regionContext) {
    try {
      // 1. Memory: Get or create conversation session
      const conversation = await ConversationMemory.getOrCreateSession(userId, sessionId, regionContext);
      
      // Append user message
      await ConversationService.appendUserMessage(conversation._id, content);

      // 2. Planning: Create execution plan
      const plan = await Planner.generatePlan(content, conversation.context);

      // 3. Execution: Run the workflow
      const result = await WorkflowEngine.executePlan(plan, conversation.context, content);

      // 4. Memory Update: Append assistant response
      await ConversationService.appendAssistantMessage(
        conversation._id, 
        result.content || "I couldn't process that request.", 
        result.structuredData
      );

      return {
        conversationId: conversation._id,
        content: result.content,
        structuredData: result.structuredData
      };
    } catch (error) {
      logger.error(`ShoppingAssistant failed: ${error.message}`);
      
      // Fallback
      return {
        content: "I'm currently experiencing technical difficulties. Please try standard search for now.",
        structuredData: {}
      };
    }
  }
}

module.exports = new ShoppingAssistant();
