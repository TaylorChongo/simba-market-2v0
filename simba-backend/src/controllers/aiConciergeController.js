const conciergeService = require('../services/conciergeService');
const { getSessionMemory, updateSessionMemory } = require('../services/assistantMemoryService');

/**
 * Handles the Simba Concierge conversational assistant.
 * Focused on service, account, and general-information queries about Simba.
 * POST /api/ai-concierge
 */
const concierge = async (req, res) => {
  try {
    const {
      message,
      sessionId,
      history = [],
      language = 'en',
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const memory = getSessionMemory(sessionId);
    const conversationHistory = memory.history.length ? memory.history : history;

    const result = await conciergeService.askConcierge({
      message: message.trim(),
      language,
      history: conversationHistory,
    });

    const updatedMemory = updateSessionMemory(sessionId, message.trim(), {
      message: result.message,
      memory: { language },
    }, language);

    res.json({
      message: result.message,
      suggestions: result.suggestions || [],
      actions: result.actions || [],
      memory: {
        language: updatedMemory.language,
      },
    });
  } catch (error) {
    console.error('Concierge Controller Error:', error);
    res.status(500).json({
      message: 'The concierge is temporarily unavailable. Please try again in a moment.',
      suggestions: [],
      actions: [],
    });
  }
};

module.exports = {
  concierge,
};
