const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 2;
const MAX_HISTORY = 16;

const emptyMemory = () => ({
  history: [],
  shoppingIntent: null,
  selectedProducts: [],
  categoriesDiscussed: [],
  userPreferences: [],
  language: 'en',
  updatedAt: Date.now(),
});

const getSessionMemory = (sessionId) => {
  cleanupExpiredSessions();

  if (!sessionId) return emptyMemory();

  const existing = sessions.get(sessionId);
  if (existing) {
    existing.updatedAt = Date.now();
    return existing;
  }

  const created = emptyMemory();
  sessions.set(sessionId, created);
  return created;
};

const updateSessionMemory = (sessionId, userMessage, assistantResult, language) => {
  if (!sessionId) return emptyMemory();

  const memory = getSessionMemory(sessionId);
  const resultMemory = assistantResult.memory || {};

  memory.history = [
    ...memory.history,
    { role: 'user', text: userMessage },
    { role: 'assistant', text: assistantResult.message || '' },
  ].slice(-MAX_HISTORY);

  memory.shoppingIntent = resultMemory.shoppingIntent || memory.shoppingIntent;
  memory.selectedProducts = mergeUnique(memory.selectedProducts, resultMemory.selectedProducts);
  memory.categoriesDiscussed = mergeUnique(memory.categoriesDiscussed, resultMemory.categoriesDiscussed);
  memory.userPreferences = mergeUnique(memory.userPreferences, resultMemory.userPreferences);
  memory.language = resultMemory.language || language || memory.language;
  memory.updatedAt = Date.now();

  sessions.set(sessionId, memory);
  return memory;
};

const mergeUnique = (current = [], next = []) => {
  const combined = [...current, ...(Array.isArray(next) ? next : [])]
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return [...new Set(combined)].slice(-20);
};

const cleanupExpiredSessions = () => {
  const now = Date.now();
  for (const [sessionId, memory] of sessions.entries()) {
    if (now - memory.updatedAt > SESSION_TTL_MS) {
      sessions.delete(sessionId);
    }
  }
};

module.exports = {
  getSessionMemory,
  updateSessionMemory,
};
