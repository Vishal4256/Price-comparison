const Conversation = require('../../models/Conversation');
const ConversationEvent = require('../../models/ConversationEvent');

class ConversationMemory {
  /**
   * Retrieves or creates an active session. Expires after 2 hours of inactivity.
   */
  async getOrCreateSession(userId, sessionId, regionContext) {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Archive expired sessions
    await Conversation.updateMany(
      { $or: [{ userId }, { sessionId }], status: 'ACTIVE', updatedAt: { $lt: twoHoursAgo } },
      { $set: { status: 'ARCHIVED' } }
    );

    let conversation = await Conversation.findOne({ 
      $or: [{ userId }, { sessionId }], 
      status: 'ACTIVE' 
    });

    if (!conversation) {
      conversation = new Conversation({
        userId,
        sessionId,
        context: {
          region: regionContext,
          budget: null,
          preferredBrands: [],
          activeProducts: []
        },
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
      });
      await conversation.save();
    } else {
      // Extend expiration on activity
      conversation.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      await conversation.save();
    }

    return conversation;
  }

  async updateContext(conversationId, updates) {
    return await Conversation.findByIdAndUpdate(
      conversationId, 
      { $set: { context: updates } },
      { new: true }
    );
  }

  async getRecentEvents(conversationId, limit = 10) {
    return await ConversationEvent.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new ConversationMemory();
