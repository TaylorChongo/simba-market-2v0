const Groq = require('groq-sdk');
const Fuse = require('fuse.js');

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'French',
  kin: 'Kinyarwanda',
};

const PAGE_ALIASES = {
  home: '/',
  groceries: '/category/Food Products',
  grocery: '/category/Food Products',
  food: '/category/Food Products',
  electronics: '/category/Kitchenware & Electronics',
  household: '/category/Home & Kitchen',
  kitchen: '/category/Kitchenware & Electronics',
  cart: '/cart',
  checkout: '/checkout',
  login: '/login',
  orders: '/dashboard/client',
};

const askShoppingAssistant = async ({ message, websiteContext, memory }) => {
  const normalizedContext = normalizeWebsiteContext(websiteContext);
  const matchedProducts = findRelevantProducts(message, normalizedContext.products, normalizedContext.categories);
  const modelContext = buildModelContext(normalizedContext, memory, matchedProducts);

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_key_here') {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        temperature: 0.35,
        max_tokens: 900,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: getSystemPrompt(modelContext.languageName) },
          ...formatMemoryHistory(memory.history),
          {
            role: 'user',
            content: JSON.stringify({
              customerMessage: message,
              websiteContext: modelContext,
            }),
          },
        ],
      });

      const parsed = safeJsonParse(completion.choices[0].message.content);
      return normalizeAssistantResult(parsed, matchedProducts, normalizedContext, message);
    } catch (error) {
      console.error('Groq shopping assistant error:', error.message);
    }
  }

  return localAssistantFallback(message, normalizedContext, memory, matchedProducts);
};

const getSystemPrompt = (languageName) => `
You are Simba, a helpful staff member at Simba Supermarket Rwanda.
Your PRIMARY role is to help customers navigate the website and find what they need.

Core Responsibilities:
1. NAVIGATION (Explicit): Help users find pages like Home, Cart, Checkout, Order History, Login, and Categories.
2. SHOPPING ASSISTANCE: Recommend products and help with shopping lists.
3. CONVERSATION: Be concise, warm, and helpful. Respond in ${languageName}.

CRITICAL BEHAVIOR RULES:
- ONLY include a "navigate" action if the user EXPLICITLY asks to "go to", "open", "show me", "visit", or "find" a specific page or section.
- DO NOT navigate automatically based on search results or recommendations unless asked.
- Only include a "search" action if they are specifically looking for items.
- If the user is already on a page (see context), acknowledge it instead of re-navigating.
- Never say you are an AI. You are a person working at the store.

Return only valid JSON:
{
  "message": "your helpful response",
  "actions": [
    {"action":"navigate","page":"Checkout"},
    {"action":"search","query":"Milk"},
    {"action":"add_to_cart","product":"Milk","quantity":1}
  ],
  "memory": { ... }
}

Navigation Targets:
- Home: "/"
- Cart: "/cart"
- Checkout: "/checkout"
- Orders/History: "/dashboard/client"
- Login: "/login"
- Groceries: "Food Products"
- Electronics: "Kitchenware & Electronics"
- Household: "Home & Kitchen"
`;

const normalizeWebsiteContext = (context = {}) => {
  const products = Array.isArray(context.products) ? context.products : [];
  const categories = Array.isArray(context.categories)
    ? context.categories
    : [...new Set(products.map((product) => product.category).filter(Boolean))];

  return {
    currentPage: context.currentPage || 'Home',
    currentCart: Array.isArray(context.currentCart) ? context.currentCart : [],
    language: context.language || 'en',
    categories,
    products: products.map(toAssistantProduct).filter((product) => product.name),
    searchResults: Array.isArray(context.searchResults) ? context.searchResults.map(toAssistantProduct) : [],
    productDetails: context.productDetails ? toAssistantProduct(context.productDetails) : null,
  };
};

const toAssistantProduct = (product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  price: Number(product.price || 0),
  description: product.description || '',
  image: product.image,
  stock: product.stock ?? product.quantity ?? null,
  inStock: product.inStock ?? product.stock !== 0,
});

const buildModelContext = (context, memory, matchedProducts) => ({
  currentPage: context.currentPage,
  currentCart: context.currentCart.map((item) => ({
    name: item.name,
    quantity: item.quantity || 1,
    price: item.price,
    category: item.category,
  })),
  language: context.language,
  languageName: LANGUAGE_NAMES[context.language] || LANGUAGE_NAMES.en,
  categories: context.categories,
  availableProducts: matchedProducts.slice(0, 20).map(stripProductForPrompt),
  searchResults: context.searchResults.slice(0, 12).map(stripProductForPrompt),
  productDetails: context.productDetails ? stripProductForPrompt(context.productDetails) : null,
  memory: {
    shoppingIntent: memory.shoppingIntent,
    selectedProducts: memory.selectedProducts,
    categoriesDiscussed: memory.categoriesDiscussed,
    userPreferences: memory.userPreferences,
  },
  websitePages: ['Home', 'Groceries', 'Electronics', 'Household', 'Cart', 'Checkout', 'Orders'],
  supportedActions: ['search', 'navigate', 'add_to_cart', 'remove_from_cart', 'track_order'],
});

const stripProductForPrompt = (product) => ({
  name: product.name,
  category: product.category,
  price: product.price,
  description: product.description,
  stock: product.stock,
  inStock: product.inStock,
});

const formatMemoryHistory = (history = []) => history.slice(-10).map((message) => ({
  role: message.role === 'assistant' ? 'assistant' : 'user',
  content: message.text || '',
}));

const findRelevantProducts = (query, products, categories = []) => {
  if (!products.length) return [];

  const expandedQuery = expandQuery(query);
  const fuse = new Fuse(products, {
    keys: ['name', 'category', 'description'],
    threshold: 0.38,
    ignoreLocation: true,
    includeScore: true,
  });

  const searchResults = fuse.search(expandedQuery).map((result) => result.item);
  const categoryMatches = categories
    .filter((category) => expandedQuery.toLowerCase().includes(String(category).toLowerCase()))
    .flatMap((category) => products.filter((product) => product.category === category));

  return uniqueProducts([...searchResults, ...categoryMatches]).slice(0, 30);
};

const expandQuery = (query = '') => {
  const synonyms = {
    cok: 'coke coca cola soda',
    coke: 'coke coca cola soda',
    charger: 'charger cable adapter electronics phone',
    'phone charger': 'phone charger cable adapter electronics',
    spaghetti: 'spaghetti pasta tomato sauce onion garlic minced meat oil spices',
    bread: 'bread butter milk jam eggs',
    tea: 'tea sugar milk biscuits',
    umuceri: 'rice umuceri',
    riz: 'rice riz',
    lait: 'milk lait',
    amata: 'milk amata',
    biscuits: 'biscuits cookies',
    kids: 'kids children juice baby',
  };

  const lower = query.toLowerCase();
  const additions = Object.entries(synonyms)
    .filter(([key]) => lower.includes(key))
    .map(([, value]) => value);

  return [query, ...additions].join(' ');
};

const normalizeAssistantResult = (result, matchedProducts, context, originalMessage) => {
  const fallback = localAssistantFallback(originalMessage, context, {}, matchedProducts);
  const normalized = {
    message: typeof result.message === 'string' && result.message.trim() ? result.message.trim() : fallback.message,
    actions: normalizeActions(result.actions),
    memory: {
      shoppingIntent: result.memory?.shoppingIntent || fallback.memory.shoppingIntent,
      selectedProducts: asStringArray(result.memory?.selectedProducts),
      categoriesDiscussed: asStringArray(result.memory?.categoriesDiscussed),
      userPreferences: asStringArray(result.memory?.userPreferences),
      language: result.memory?.language || context.language,
    },
    products: matchedProducts.slice(0, 8),
  };

  if (!normalized.actions.some((action) => action.action === 'search') && shouldSearch(originalMessage)) {
    normalized.actions.push({ action: 'search', query: originalMessage });
  }

  return normalized;
};

const normalizeActions = (actions = []) => {
  if (!Array.isArray(actions)) return [];

  return actions
    .filter((action) => action && typeof action.action === 'string')
    .map((action) => {
      if (action.action === 'add_to_cart') {
        return {
          action: 'add_to_cart',
          product: String(action.product || '').trim(),
          quantity: Math.max(1, Number.parseInt(action.quantity || 1, 10)),
        };
      }
      if (action.action === 'remove_from_cart') {
        return { action: 'remove_from_cart', product: String(action.product || '').trim() };
      }
      if (action.action === 'navigate') {
        return { action: 'navigate', page: String(action.page || '').trim() };
      }
      if (action.action === 'track_order') {
        return { action: 'track_order', orderId: String(action.orderId || '').trim() };
      }
      return { action: 'search', query: String(action.query || action.product || '').trim() };
    })
    .filter((action) => {
      if (action.action === 'search') return Boolean(action.query);
      if (action.action === 'navigate') return Boolean(action.page);
      if (action.action === 'add_to_cart') return Boolean(action.product);
      if (action.action === 'remove_from_cart') return Boolean(action.product);
      return true;
    })
    .slice(0, 6);
};

const localAssistantFallback = (message, context, memory = {}, matchedProducts = []) => {
  const language = context.language || detectLanguage(message);
  const lower = message.toLowerCase();
  const actions = [];
  const selectedProducts = matchedProducts.slice(0, 4).map((product) => product.name);
  const categoriesDiscussed = [...new Set(matchedProducts.slice(0, 4).map((product) => product.category).filter(Boolean))];

  if (shouldNavigate(lower)) {
    const page = Object.keys(PAGE_ALIASES).find((key) => lower.includes(key)) || 'home';
    actions.push({ action: 'navigate', page });
  }

  if (shouldTrackOrder(lower)) {
    const orderId = message.match(/[a-z0-9-]{5,}/i)?.[0] || '';
    actions.push({ action: 'track_order', orderId });
  }

  if (shouldAdd(lower)) {
    const product = matchedProducts[0]?.name || cleanProductPhrase(message);
    actions.push({ action: 'add_to_cart', product, quantity: extractQuantity(message) });
  } else if (shouldRemove(lower)) {
    actions.push({ action: 'remove_from_cart', product: cleanProductPhrase(message) });
  } else if (shouldSearch(message)) {
    actions.push({ action: 'search', query: message });
  }

  return {
    message: buildFallbackMessage(message, language, matchedProducts, memory),
    actions,
    memory: {
      shoppingIntent: inferShoppingIntent(message, memory),
      selectedProducts,
      categoriesDiscussed,
      userPreferences: [],
      language,
    },
    products: matchedProducts.slice(0, 8),
  };
};

const buildFallbackMessage = (message, language, matchedProducts, memory = {}) => {
  const lower = message.toLowerCase();
  const names = matchedProducts.slice(0, 3).map((product) => product.name);

  if (lower.includes('spaghetti')) {
    return translate(language, {
      en: 'For spaghetti, you may need pasta, tomato sauce, onions, garlic, minced meat, spices, and cooking oil. I found a few useful options.',
      fr: "Pour les spaghetti, vous aurez besoin de pâtes, sauce tomate, oignons, ail, viande hachée, épices et huile de cuisson. J'ai trouvé quelques options utiles.",
      kin: 'Kuri spaghetti, wakenera pasta, isosi y inyanya, ibitunguru, tungurusumu, inyama ziseye, ibirungo n amavuta yo guteka. Nakubonye amahitamo make.',
    });
  }

  if (lower.includes('bread') || lower.includes('pain') || lower.includes('umugati')) {
    return translate(language, {
      en: 'Bread goes well with butter, milk, jam, eggs, or tea. I can help you add any of those too.',
      fr: "Le pain va bien avec du beurre, du lait, de la confiture, des oeufs ou du thé. Je peux aussi les ajouter.",
      kin: 'Umugati ujyanirana na beurre, amata, confiture, amagi cyangwa icyayi. Nshobora kugufasha kubyongeramo.',
    });
  }

  if (names.length > 0) {
    return translate(language, {
      en: `I found ${names.join(', ')}. Do you want a specific brand, size, or price range?`,
      fr: `J'ai trouvé ${names.join(', ')}. Voulez-vous une marque, une taille ou un budget précis ?`,
      kin: `Nabonye ${names.join(', ')}. Wifuza brand, ingano cyangwa igiciro runaka?`,
    });
  }

  return translate(language, {
    en: 'I can help with that. Tell me the product, meal, budget, or category you are shopping for.',
    fr: "Je peux vous aider. Dites-moi le produit, le repas, le budget ou la catégorie que vous cherchez.",
    kin: 'Nshobora kugufasha. Mbwira igicuruzwa, ifunguro, budget cyangwa category ushaka.',
  });
};

const translate = (language, values) => values[language] || values.en;

const shouldSearch = (message = '') => {
  const lower = message.toLowerCase();
  return !shouldTrackOrder(lower) && (
    /\b(need|want|find|search|show|recommend|suggest|buy|ingredient|ingredients|looking|have|ukeneye|ndashaka|chercher|besoin|trouver)\b/i.test(lower)
    || lower.split(/\s+/).length <= 4
  );
};

const shouldAdd = (lower) => /\b(add|buy|put|onger|ajoute|ajouter|shyira)\b/i.test(lower);
const shouldRemove = (lower) => /\b(remove|delete|kuramo|retire|retirer|supprimer)\b/i.test(lower);
const shouldNavigate = (lower) => /\b(go|open|navigate|page|jya|aller|ouvrir)\b/i.test(lower);
const shouldTrackOrder = (lower) => /\b(track|order|commande|kurikirana)\b/i.test(lower);

const cleanProductPhrase = (message = '') => message
  .replace(/\b(add|buy|put|remove|delete|from|cart|to|my|please|ajouter|retirer|supprimer|shyira|kuramo)\b/gi, '')
  .trim();

const extractQuantity = (message = '') => {
  const match = message.match(/\b(\d{1,2})\b/);
  return match ? Number.parseInt(match[1], 10) : 1;
};

const inferShoppingIntent = (message, memory = {}) => {
  if (/\b(ingredient|ingredients|meal|cook|recipe|spaghetti|breakfast|dinner|lunch)\b/i.test(message)) {
    return message;
  }
  return memory.shoppingIntent || null;
};

const detectLanguage = (message = '') => {
  const lower = message.toLowerCase();
  if (/[àâçéèêëîïôùûüÿœ]|bonjour|merci|besoin|chercher|ajouter/.test(lower)) return 'fr';
  if (/muraho|amakuru|ndashaka|keneye|ongeramo|amata|umuceri|icyayi|murakoze/.test(lower)) return 'kin';
  return 'en';
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    const match = String(value || '').match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
};

const asStringArray = (value) => Array.isArray(value) ? value.map(String).filter(Boolean) : [];

const uniqueProducts = (products) => {
  const seen = new Set();
  return products.filter((product) => {
    const key = product.id || product.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

module.exports = {
  askShoppingAssistant,
  findRelevantProducts,
};
