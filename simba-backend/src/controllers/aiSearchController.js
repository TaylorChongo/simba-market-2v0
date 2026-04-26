const { prisma } = require('../config/db');
const aiSearchService = require('../services/aiSearchService');

/**
 * Handles conversational AI product search
 * POST /api/ai-search
 */
const aiSearch = async (req, res) => {
  try {
    const { query, history = [] } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // 1. Fetch catalog summary for AI context
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        image: true,
      }
    });

    // 2. Send query + catalog summary + history to AI service
    const catalogSummary = allProducts.map(p => ({ 
      name: p.name, 
      category: p.category, 
      price: p.price 
    }));

    const aiResult = await aiSearchService.extractSearchIntent(query, catalogSummary.slice(0, 100), history);

    const { keywords = [], category, maxPrice, intent } = aiResult;

    // 3. Perform backend filtering based on AI extraction
    let matchedProducts = allProducts.filter(product => {
      // Category match (loose)
      if (category && !product.category.toLowerCase().includes(category.toLowerCase()) && !category.toLowerCase().includes(product.category.toLowerCase())) {
        return false;
      }

      // Price match
      if (maxPrice && product.price > maxPrice) {
        return false;
      }

      // Keyword match (name or category)
      if (keywords && keywords.length > 0) {
        const nameLower = product.name.toLowerCase();
        const catLower = product.category.toLowerCase();
        return keywords.some(kw => nameLower.includes(kw.toLowerCase()) || catLower.includes(kw.toLowerCase()));
      }

      return true;
    });

    // 4. Return explanation + top matches
    res.json({
      message: intent,
      products: matchedProducts.slice(0, 10) // Top 10 matches
    });

  } catch (error) {
    console.error('AI Search Controller Error:', error);
    res.status(500).json({ message: 'Internal server error during AI search' });
  }
};

module.exports = {
  aiSearch,
};
