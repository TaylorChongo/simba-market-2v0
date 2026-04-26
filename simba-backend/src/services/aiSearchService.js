const Groq = require('groq-sdk');

/**
 * Extracts intent and filters from user query
 * Uses Groq if API key is present, otherwise falls back to a smart local extractor
 */
const extractSearchIntent = async (query, catalogSummary, history = []) => {
  // If no API key, use the Smart Local Extractor
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_key_here') {
    return smartLocalExtract(query, catalogSummary);
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const messages = [
      {
        role: 'system',
        content: `You are an assistant for Simba Supermarket in Rwanda. 
        Your goal is to help users find products from the catalog.
        
        IMPORTANT RULES:
        - Extract search keywords, category, and max price from the user's query.
        - Use the provided catalog summary to ensure suggestions are relevant.
        - If the user is asking a follow-up question, use the history to understand the context.
        - DO NOT suggest products that are not in the catalog.
        - Return ONLY a structured JSON object.
        
        JSON Format:
        {
          "keywords": ["word1", "word2"],
          "category": "extracted category or null",
          "maxPrice": number or null,
          "intent": "a direct friendly conversational response (e.g., 'I found some fresh milk for you under 2000 RWF')"
        }`
      },
      ...history.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
      })),
      {
        role: 'user',
        content: `Catalog: ${JSON.stringify(catalogSummary)}\n\nUser Query: "${query}"`
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error('Groq AI Search Error, falling back to local:', error);
    return smartLocalExtract(query, catalogSummary);
  }
};

/**
 * A local intent extractor that doesn't require an API key
 */
const smartLocalExtract = (query, catalog) => {
  const q = query.toLowerCase();
  
  // Extract max price (e.g., "under 2000", "less than 500")
  let maxPrice = null;
  const priceMatch = q.match(/(?:under|less than|below|max|up to|rwf)\s*(\d+)/i);
  if (priceMatch) maxPrice = parseInt(priceMatch[1]);

  // Extract keywords (simple tokenization)
  const stopWords = ['i', 'need', 'want', 'buy', 'do', 'you', 'have', 'fresh', 'the', 'a', 'an', 'some', 'any', 'for', 'cheap', 'best', 'good', 'something', 'please', 'me', 'with'];
  const keywords = q.split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word) && !word.match(/^\d+$/));

  // Try to find a category match from the catalog
  const categories = [...new Set(catalog.map(p => p.category.toLowerCase()))];
  const matchedCategory = categories.find(cat => q.includes(cat));

  // Determine intent message
  let intent = `I've analyzed your request for "${query}". Here are the best matches from our catalog.`;
  if (matchedCategory) intent += ` I'm focusing on the ${matchedCategory} category.`;
  if (maxPrice) intent += ` I've also applied a price filter for items under ${maxPrice} RWF.`;
  if (keywords.length === 0 && !matchedCategory && !maxPrice) intent = "How can I help you find something today? You can search for products, categories, or price ranges.";

  return {
    keywords,
    category: matchedCategory,
    maxPrice,
    intent
  };
};

module.exports = {
  extractSearchIntent,
};
