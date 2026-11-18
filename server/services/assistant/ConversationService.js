const ConversationEvent = require('../../models/ConversationEvent');
const logger = require('../../utils/logger');

class ConversationService {
  async appendUserMessage(conversationId, content) {
    const event = new ConversationEvent({
      conversationId,
      role: 'USER',
      content
    });
    await event.save();
    return event;
  }

  async appendAssistantMessage(conversationId, content, structuredData = null) {
    const event = new ConversationEvent({
      conversationId,
      role: 'ASSISTANT',
      content,
      structuredData
    });
    await event.save();
    return event;
  }

  async appendToolCall(conversationId, toolCalls) {
    const event = new ConversationEvent({
      conversationId,
      role: 'TOOL',
      toolCalls
    });
    await event.save();
    return event;
  }
}

module.exports = new ConversationService();
