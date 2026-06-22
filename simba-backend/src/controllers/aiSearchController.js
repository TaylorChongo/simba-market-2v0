const { prisma } = require('../config/db');
const aiSearchService = require('../services/aiSearchService');
const shoppingAssistantService = require('../services/shoppingAssistantService');
const { getSessionMemory, updateSessionMemory } = require('../services/assistantMemoryService');
const Fuse = require('fuse.js');

/**
 * Handles conversational AI product search
 * POST /api/ai-search
 */
const aiSearch = async (req, res) => {
  try {
    const { query, history = [], mode = 'search', language = 'en' } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // 1. Fetch all products for filtering and catalog sample
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        image: true,
      }
    });

    // 2. Prepare context for AI (unique categories + sample products)
    const categories = [...new Set(allProducts.map(p => p.category))];
    const catalogSummary = allProducts.slice(0, 50).map(p => ({ 
      name: p.name, 
      category: p.category, 
      price: p.price 
    }));
    
    // Pass categories separately to help AI map correctly
    const aiContext = {
      categories,
      sampleProducts: catalogSummary
    };

    const aiResult = await aiSearchService.extractSearchIntent(query, aiContext, history, mode, language);

    const { keywords = [], category, maxPrice, intent } = aiResult;

    // 3. Perform backend filtering
    let matchedProducts = [];
    const hasIntent = (keywords && keywords.length > 0) || category || maxPrice;

    if (hasIntent) {
      matchedProducts = allProducts;

      // A. Price match (Strict)
      if (maxPrice) {
        matchedProducts = matchedProducts.filter(p => p.price <= maxPrice);
      }

      // B. Keyword match against full pool (category is a boost, not a hard filter)
      if (keywords && keywords.length > 0) {
        const fuse = new Fuse(matchedProducts, {
          keys: ['name', 'category'],
          threshold: 0.4,
          includeScore: true
        });

        let allResults = [];
        keywords.forEach(kw => {
          allResults = [...allResults, ...fuse.search(kw)];
        });

        if (allResults.length > 0) {
          allResults.sort((a, b) => a.score - b.score);
          const seen = new Set();
          const uniqueProducts = [];
          for (const res of allResults) {
            if (!seen.has(res.item.id)) {
              seen.add(res.item.id);
              uniqueProducts.push(res.item);
            }
          }
          // Boost: category matches float to the top
          if (category) {
            const catLower = category.toLowerCase();
            uniqueProducts.sort((a, b) => {
              const aMatch = a.category.toLowerCase().includes(catLower) ? 0 : 1;
              const bMatch = b.category.toLowerCase().includes(catLower) ? 0 : 1;
              return aMatch - bMatch;
            });
          }
          matchedProducts = uniqueProducts;
        } else {
          // Fallback: substring match
          matchedProducts = matchedProducts.filter(product => {
            const nameLower = product.name.toLowerCase();
            const catLower2 = product.category.toLowerCase();
            return keywords.some(kw =>
              nameLower.includes(kw.toLowerCase()) ||
              catLower2.includes(kw.toLowerCase())
            );
          });
        }
      } else if (category) {
        // Category-only search (no keywords)
        const catLower = category.toLowerCase();
        matchedProducts = matchedProducts.filter(p =>
          p.category.toLowerCase().includes(catLower) || catLower.includes(p.category.toLowerCase())
        );
      }
    }

    // 4. Handle Empty Results vs AI Intent
    let finalIntent = intent;
    const topMatches = matchedProducts.slice(0, 12);

    if (topMatches.length === 0) {
      if (hasIntent) {
        finalIntent = `I'm sorry, I couldn't find any products matching your request in our catalog right now. Try searching for something else!`;
      } else if (mode === 'assistant') {
        // In assistant mode, if no keywords were extracted, trust the conversational intent
        finalIntent = intent;
        matchedProducts = []; // Don't show products for a general question
      } else {
        finalIntent = "I've pulled up some of our latest products for you. Is there something specific you're looking for?";
        matchedProducts = allProducts.slice(0, 12);
      }
    } else if (intent && (intent.toLowerCase().includes("couldn't find") || intent.toLowerCase().includes("no results"))) {
        // If AI thought there were no results but we found some, override intent
        finalIntent = mode === 'assistant' 
          ? `I've found some products for you! ${intent}`
          : `I've found these products for you matching your request.`;
    }

    res.json({
      message: finalIntent,
      products: topMatches
    });

  } catch (error) {
    console.error('AI Search Controller Error:', error);
    res.status(500).json({ message: 'Internal server error during AI search' });
  }
};

/**
 * Handles the full shopping assistant experience.
 * POST /api/ai-search/assistant
 */
const shoppingAssistant = async (req, res) => {
  try {
    const {
      message,
      query,
      sessionId,
      context = {},
      language = context.language || 'en',
    } = req.body;
    const userMessage = message || query;

    if (!userMessage) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const branch = context.selectedBranch;
    const products = await prisma.product.findMany({
      ...(branch ? {
        include: {
          stocks: {
            where: { branchName: branch },
          },
        },
      } : {}),
      orderBy: { name: 'asc' },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
      stock: branch ? product.stocks?.[0]?.stock || 0 : null,
      inStock: branch ? (product.stocks?.[0]?.stock || 0) > 0 : true,
    }));

    const categories = [...new Set(formattedProducts.map((product) => product.category).filter(Boolean))];
    const memory = getSessionMemory(sessionId);
    const websiteContext = {
      ...context,
      language,
      categories: context.categories?.length ? context.categories : categories,
      products: formattedProducts,
    };

    const result = await shoppingAssistantService.askShoppingAssistant({
      message: userMessage,
      websiteContext,
      memory,
    });

    const updatedMemory = updateSessionMemory(sessionId, userMessage, result, language);

    res.json({
      message: result.message,
      actions: result.actions || [],
      products: result.products || [],
      memory: {
        shoppingIntent: updatedMemory.shoppingIntent,
        selectedProducts: updatedMemory.selectedProducts,
        categoriesDiscussed: updatedMemory.categoriesDiscussed,
        userPreferences: updatedMemory.userPreferences,
        language: updatedMemory.language,
      },
    });
  } catch (error) {
    console.error('Shopping Assistant Controller Error:', error);
    res.status(500).json({
      message: 'The shopping assistant is temporarily unavailable. Please try again.',
      actions: [],
      products: [],
    });
  }
};

module.exports = {
  aiSearch,
  shoppingAssistant,
};
