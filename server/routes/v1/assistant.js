const express = require('express');
const router = express.Router();
const ShoppingAssistant = require('../../services/assistant/ShoppingAssistant');
const RegionService = require('../../services/localization/RegionService');
const { successResponse } = require('../../utils/response');
const { requireAuth, optionalAuth } = require('../../middlewares/auth');

router.post('/message', optionalAuth, async (req, res, next) => {
  try {
    const { content, sessionId } = req.body;
    
    // We expect either an authenticated user or a temporary session ID
    const userId = req.user ? req.user.id : null;
    const activeSessionId = sessionId || req.sessionID || 'guest-session';
    
    const regionContext = RegionService.getRegionContext(req);

    const result = await ShoppingAssistant.processMessage(
      userId, 
      activeSessionId, 
      content, 
      regionContext
    );

    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
