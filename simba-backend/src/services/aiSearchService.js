const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Extracts intent and filters from user query
 * Tries Groq first, then Gemini, then falls back to local
 */
const extractSearchIntent = async (query, catalogSummary, history = [], mode = 'search', language = 'en') => {
  const langName = language === 'fr' ? 'French' : language === 'kin' ? 'Kinyarwanda' : 'English';
  const systemPrompt = mode === 'assistant' ? getAssistantPrompt(langName) : getSearchPrompt(langName);
  
  // 1. Try Groq if key exists
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_key_here') {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...formatHistoryForGroq(history),
        {
          role: 'user',
          content: `Language: ${langName}\nCatalog Context: ${JSON.stringify(catalogSummary)}\n\nUser Query: "${query}"`
        }
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
      });

      return JSON.parse(chatCompletion.choices[0].message.content);
    } catch (error) {
      console.error('Groq Error:', error.message);
    }
  }

  // 2. Try Gemini if key exists
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `${systemPrompt}\n\nHistory: ${JSON.stringify(history)}\n\nLanguage: ${langName}\nCatalog Context: ${JSON.stringify(catalogSummary)}\n\nUser Query: "${query}"`;
      
      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Gemini Error:', error.message);
    }
  }

  // 3. Fallback to Smart Local Extractor
  return smartLocalExtract(query, catalogSummary);
};

const getSearchPrompt = (lang) => `
You are an expert shopping assistant for Simba Supermarket in Rwanda. 
Your goal is to accurately understand user search intent and map it to catalog products.

IMPORTANT RULES:
1. LANGUAGE: Respond ONLY in ${lang}.
2. TYPOS & NORMALIZATION: Normalize typos (e.g., "malk" -> "milk").
3. EXTRACTION: Extract search keywords, category, and max price.
4. INTENT MESSAGE: Generate a friendly, helpful Rwandan-style response in the past tense.
5. NO NEGATIVITY: Avoid saying "I couldn't find any products" if possible.
6. CONTEXT: Use chat history to handle follow-up questions.

JSON Format:
{
  "keywords": ["normalized_keyword1"],
  "category": "Category or null",
  "maxPrice": number or null,
  "intent": "Conversational response in ${lang}"
}
`;

const getAssistantPrompt = (lang) => `
Act as a friendly, charismatic staff member at Simba Supermarket in Rwanda. 
Your name is Simba. You are a REAL PERSON, not an AI or a bot.

CONVERSATION RULES:
1. LANGUAGE: Respond ONLY in ${lang}.
2. BE CHILL: Don't be a corporate robot. Use casual but polite language. No long speeches.
3. NO SCRIPTED GREETINGS: Avoid saying "Welcome to Simba Supermarket" in every turn. If someone says "Hello", just say "Muraho! How are you?" or "Hey! How's your day going?".
4. REACTIVE: Only answer what is asked. 
5. USE HISTORY: Look at the previous messages to avoid repeating introductions.
6. RWANDAN FLAIR: You can use occasional Kinyarwanda greetings (like "Muraho" or "Amakuru") even if the language is English or French, but keep the rest of the response strictly in ${lang}.
7. NO AI TALK: Never mention you are an AI or a bot. You are a person working at the store.
8. DON'T BE A SEARCH BAR: If they are just chatting, chat back!

KNOWLEDGE BASE:
- We've been serving Kigali since 1990.
- Branches: Kigali Heights, Kimironko, Gishushu, etc.
- Hours: 7 AM - 10 PM. We deliver in Kigali.

JSON Format:
{
  "keywords": ["any products they want to buy"],
  "category": "Category or null",
  "maxPrice": number or null,
  "intent": "Your warm, human-to-human response in ${lang}"
}
`;

const formatHistoryForGroq = (history) => {
  return history.map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));
};

/**
 * A local intent extractor that doesn't require an API key
 */
const smartLocalExtract = (query, catalogContext) => {
  const q = query.toLowerCase();
  
  // Handle different catalog structures
  const categories = Array.isArray(catalogContext) 
    ? [...new Set(catalogContext.map(p => p.category))]
    : (catalogContext.categories || []);

  // Extract max price (e.g., "under 2000", "less than 500", "below 1000 RWF")
  let maxPrice = null;
  const priceMatch = q.match(/(?:under|less than|below|max|up to|rwf|price|costing)\s*(\d+)/i);
  if (priceMatch) {
    const allNumbers = q.match(/\d+/g);
    if (allNumbers) {
      maxPrice = parseInt(priceMatch[1]) || parseInt(allNumbers.find(n => parseInt(n) > 100));
    }
  }

  // Extract keywords
  const stopWords = [
    'i', 'need', 'want', 'buy', 'do', 'you', 'have', 'fresh', 'the', 'a', 'an', 'some', 'any', 
    'for', 'cheap', 'best', 'good', 'something', 'please', 'me', 'with', 'show', 'find', 'search',
    'looking', 'can', 'help', 'give', 'get', 'is', 'are', 'there', 'any', 'could', 'would', 'thanks', 'thank',
    'hello', 'hi', 'hey', 'greetings', 'morning', 'afternoon', 'evening', 'how', 'are', 'you', 'what', 'up',
    'welcome', 'simba', 'assistant', 'market', 'supermarket'
  ];
  
  const words = q.replace(/[^\w\s]/g, '').split(/\s+/);
  const keywords = words.filter(word => 
    word.length > 2 && 
    !stopWords.includes(word) && 
    !word.match(/^\d+$/)
  );

  // Try to find a category match
  let matchedCategory = null;
  matchedCategory = categories.find(cat => q.includes(cat.toLowerCase()));
  
  if (!matchedCategory) {
    matchedCategory = categories.find(cat => {
      const catWords = cat.toLowerCase().split(/\s+/);
      return catWords.some(cw => keywords.includes(cw) && cw.length > 3);
    });
  }

  // Determine intent message
  let intent = "";
  if (matchedCategory) {
    intent = `I've found these great options in our **${matchedCategory}** category for you.`;
  } else if (keywords.length > 0) {
    intent = `I've found these products matching **"${keywords.join(' ')}"** for you.`;
  } else {
    intent = "I've pulled up our latest products for you. Is there something specific you're looking for?";
  }

  if (maxPrice) {
    intent += ` (Filtered under ${maxPrice.toLocaleString()} RWF)`;
  }

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
