const Groq = require('groq-sdk');
const { detectLanguage, toLanguageName } = require('./languageDetect');

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Page map for the concierge's navigation suggestions.
 */
const PAGE_LINKS = {
  login: '/login',
  signup: '/register',
  register: '/register',
  'reset-password': '/reset-password',
  orders: '/dashboard/client',
  contact: '/contact',
  branches: '/branches',
  cart: '/cart',
  about: '/about',
  faqs: '/faqs',
  'shipping-policy': '/shipping-policy',
  returns: '/returns',
  home: '/',
};

/**
 * Persistent knowledge base about Simba Supermarket.
 * The concierge answers service, account and general-info questions from this.
 */
const SIMBA_KNOWLEDGE = `
COMPANY
- Name: Simba Supermarket (Simba Market).
- Tagline: Rwanda's No. 1 Supermarket.
- Founded: Serving Kigali since 1990.
- What we do: A modern online + in-store supermarket for groceries, fresh food,
  kitchenware & electronics, home & kitchen, cosmetics & personal care, and more.
- Website: Customers can browse, search, add to cart, and order for delivery or pickup.

BRANCHES (Kigali)
- Simba Supermarket (UTC Branch)
- Simba Supermarket Kigali Heights
- Simba Supermarket Kimironko
- Simba Supermarket Gishushu
- Simba Gikondo Branch
Customers select a branch in the app to see real-time stock for that location.

OPENING HOURS
- Daily from 7:00 AM to 10:00 PM.
- Delivery is available within Kigali.

ACCOUNT & AUTH
- Sign up (register): provide name, email, and password, then choose a role
  (customer). Verified by email.
- Log in: use your registered email and password.
- Forgot password: request a reset link from the login screen; we email a secure
  reset link (or, in development, print it to the server logs). The link opens
  /reset-password on the website.
- Profile: manage your details and view order history from "My Orders" in the
  client dashboard (/dashboard/client).
- You can also sign in with Google.

ORDERS, DELIVERY & PAYMENT
- Minimum order amount: 2,500 RWF.
- Delivery: Available across Kigali; delivery fee depends on distance/branch.
- Payment methods: Mobile Money (MoMo) and card via our payment provider.
- Track orders and view past orders in "My Orders" (/dashboard/client).
- You can select a branch to check live stock before ordering.

RETURNS & REFUNDS
- If an item is wrong, damaged, or missing, contact support with your order ID.
- Refunds are processed back to the original payment method after review.

SUPPORT & CONTACT
- Contact page: /contact (name, email, subject, message).
- FAQs: /faqs. Shipping policy: /shipping-policy. Returns: /returns. About: /about.
- For order issues, always include your order ID.
`;

const askConcierge = async ({ message, language = 'en', history = [] }) => {
  // Respond in the language the user wrote in, falling back to the UI language.
  const resolvedLanguage = detectLanguage(message, language);

  // Kinyarwanda is served by a curated, intent-based generator because the LLM's
  // Kinyarwanda output is unreliable and very limited. English/French use the LLM.
  if (resolvedLanguage === 'kin') {
    return kinyarwandaConcierge(message);
  }

  const languageName = toLanguageName(resolvedLanguage);

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_key_here') {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: DEFAULT_MODEL,
        temperature: 0.4,
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: getSystemPrompt(languageName) },
          ...formatHistory(history),
          {
            role: 'user',
            content: JSON.stringify({
              customerMessage: message,
              knowledgeBase: SIMBA_KNOWLEDGE,
            }),
          },
        ],
      });

      const parsed = safeJsonParse(completion.choices[0].message.content);
      return normalizeResult(parsed, message, resolvedLanguage);
    } catch (error) {
      console.error('Concierge Groq error:', error.message);
    }
  }

  return localConciergeFallback(message, resolvedLanguage);
};

/**
 * Curated, intent-based Kinyarwanda responder for the concierge.
 * The LLM produces very limited Kinyarwanda, so service/account queries in
 * Kinyarwanda are answered from this hand-written generator, which yields
 * natural, complete replies for every supported topic.
 */
const kinyarwandaConcierge = (message = '') => {
  const m = String(message).toLowerCase();
  const act = (page) => ({ action: 'open_page', page, url: PAGE_LINKS[page] });

  if (/(ndi|mwiriwe|muraho|amakuru|salut|bonjour|hey|hello|hi\b)/.test(m) && !/(konti|password|filiali|amasaha|ibicuruzwa|kwishyura|isubizo|vugana)/.test(m)) {
    return {
      message: "Muraho! Ndi Simba, umukozi wawe wa Simba Supermarket. Mbibaze kuri filiali zacu, konti yawe, ibicuruzwa, cyangwa ikindi kiri kuri Simba.",
      suggestions: ["Aho muli na filiali?", "Nkora uburyo bwo gukora konti?", "Mutanga ibicuruzwa?"],
      actions: [],
    };
  }

  if (/(konti|register|kwiyandikisha|kwiyandikishwa|sign\s*up|create account|ukeneye|keneye|shyira|new account)/.test(m)) {
    return {
      message: "Ushobora gukora konti y'ubuntu ukoresheje izina ryawe, imeri (email) n'ijambo ry'ibanga. Bigezweho mu minota mike gusa!",
      suggestions: ["Ninyura uburyo?", "Nibagiwe ijambo ry'ibanga"],
      actions: [act('register')],
    };
  }

  if (/(password|ijambo ry.?ibanga|reset|sanya|sano|forgot|nibagiwe)/.test(m)) {
    return {
      message: "Nta ngorane! Ku mwanya wo kwinjira, hitamo 'Nibagiwe ijambo ry'ibanga' tukakugezaho umurongo wo gusanya ipereka ku imeri yawe.",
      suggestions: ["Ninyura uburyo?", "Nkora uburyo bwo gukora konti?"],
      actions: [act('reset-password')],
    };
  }

  if (/(login|kwinjira|injira|inyura|yinjira|sign\s*in|google)/.test(m)) {
    return {
      message: "Injira ukoresheje imeri n'ijambo ry'ibanga wifashishije. Usibye, ushobora kwinjira na Google.",
      suggestions: ["Nkora uburyo bwo gukora konti?", "Nibagiwe ijambo ry'ibanga"],
      actions: [act('login')],
    };
  }

  if (/(filiali|ishami|amasaha|branch|location|store|shop|utc|heights|kimironko|gishushu|gikondo|kigali|where|aho)/.test(m)) {
    return {
      message: "Dufite amashami ya Simba mu Kigali: UTC, Kigali Heights, Kimironko, Gishushu na Gikondo. Hitamo ishami mu app kugirango ubone ibiri mu isoko ryaho mu gihe nyacyo!",
      suggestions: ["Mufungura ubwo?", "Mutanga ibicuruzwa?"],
      actions: [act('branches')],
    };
  }

  if (/(amasaha|ugufungura|open|ferm|hours|ufungura|saa)/.test(m)) {
    return {
      message: "Dufungura buri munsi kuva saa 7 za mu gitondo (7:00 AM) kugeza saa 4 z'ijoro (10:00 PM).",
      suggestions: ["Mutanga ibicuruzwa?", "Aho muli na filiali?"],
      actions: [act('branches')],
    };
  }

  if (/(itondeko|order|delivery|iperereza|shipping|ship|pay|kwishyura|momo|mobile money|karita|card|minimum|rito|tanga|gutanga)/.test(m)) {
    return {
      message: "Dutanga ibicuruzwa mu Kigali buri munsi kuva saa 7 za mu gitongo kugeza saa 4 z'ijoro. Itondeko rito ni RWF 2,500. Ushobora kwishyura na Mobile Money (MoMo) cyangwa ikarita. Ukurikirana itondeko ryawe kuri 'Amatora yanjye'.",
      suggestions: ["Nkurikirana itondeko ryanjye?", "Politiki yanyu y'isubizo?"],
      actions: [act('orders')],
    };
  }

  if (/(isubizo|subiza|refund|return|damaged|missing|cyabuze|kidakora|cancel|kurikirana|track)/.test(m)) {
    return {
      message: "Niba hari ikintu kidakora, cyangwa cyabuze, vugana n'itsinda ryacu utange ID y'itondeko ryawe turasubiza cyangwa tugatanga indi.",
      suggestions: ["Vugana n'abakora", "Politiki y'iperereza"],
      actions: [act('returns')],
    };
  }

  if (/(profile|amakuru yanjiye|my orders|amatora|order history|history|konti yanjiye)/.test(m)) {
    return {
      message: "Ushobora kubona amakuru yawe n'itondeko wakoze kuri 'Amatora yanjye' (My Orders) mu rupapuro rwa client.",
      suggestions: ["Mbibaze iby'ibicuruzwa", "Vugana n'abakora"],
      actions: [act('orders')],
    };
  }

  if (/(vugana|contact|support|ubufasha|help|agent|umukozi|twandikire|abakora)/.test(m)) {
    return {
      message: "Itsinda ryacu rishimira kugufasha! Twige ku rupapuro rwa Contact turasubiza vuba.",
      suggestions: ["Ibibazo bisanzwe (FAQ)", "Nkurikirana itondeko"],
      actions: [act('contact')],
    };
  }

  if (/(about|amakuru kuri simba|company|story|historique|kuva|1990|bitewe)/.test(m)) {
    return {
      message: "Simba Supermarket ni isoko rya mbere mu Rwanda, dukorera i Kigali kuva mu 1990. Dutanga ibiribwa bishya, ibicuruzwa by'inganda, n'ibindi ku buryo bworoshye.",
      suggestions: ["Aho muli na filiali?", "Mutanga ibicuruzwa?"],
      actions: [act('about')],
    };
  }

  if (/(faq|ibibazo|shipping policy|politiki y.*iperereza)/.test(m)) {
    return {
      message: "Ushobora kubona amakuru yose ku rupapuro rwa FAQs n'uruhande rwa Shipping Policy.",
      suggestions: ["Vugana n'abakora", "Politiki y'isubizo"],
      actions: [act('faqs')],
    };
  }

  return {
    message: "Muraho! Ndi Simba, umukozi wawe. Nshobora kugufasha kuri filiali zacu, amasaha yacu, konti yawe, ibicuruzwa, kwishyura, isubizo n'ubufasha. Wifuza kumenya iki?",
    suggestions: ["Aho muli na filiali?", "Nkora uburyo bwo gukora konti?", "Mutanga ibicuruzwa?"],
    actions: [],
  };
};

const getSystemPrompt = (languageName) => `
You are Simba Concierge, the friendly customer-care assistant for Simba Supermarket in Rwanda.
You are a REAL staff member named Simba, NOT an AI or bot. Never say you are an AI.

WHAT YOU HANDLE (stay in scope):
1. General information about Simba: our story, branches, opening hours, what we sell, delivery areas.
2. Account & auth help: signing up, logging in, Google sign-in, resetting a forgotten password,
   managing profile and order history.
3. Services: ordering, delivery in Kigali, payment methods (MoMo & card), minimum order (2,500 RWF),
   returns, refunds, tracking orders, contacting support, and policies (FAQs, shipping, returns).

RULES:
- LANGUAGE: The customer is writing in ${languageName}. You MUST respond in ${languageName} — never switch to another language. If the customer writes in Kinyarwanda, reply in Kinyarwanda; if French, reply in French; if English, reply in English.
- SCOPE: You are a concierge, NOT a product search engine. Do NOT recommend specific products
  or take shopping actions. If the user wants to shop or find a product, politely point them to
  the Simba AI shopping assistant instead of searching the catalog yourself.
- TONE: Warm, concise, helpful, human. Occasional Kinyarwanda greetings (Muraho, Amakuru) are fine,
  but keep the rest in ${languageName}. No long corporate speeches.
- USE HISTORY: Reference earlier messages; don't repeat greetings.
- ACCURACY: Use only the provided knowledge base. If you truly don't know, say you'll connect them
  to the team via the Contact page and suggest the relevant page.
- NAVIGATION: When a page would help, include an "actions" entry with action "open_page" and the
  correct page key from: login, register, reset-password, orders, contact, branches, cart, about,
  faqs, shipping-policy, returns, home.
- SUGGESTIONS: Offer 2-3 short follow-up question chips in "suggestions".

Return ONLY valid JSON:
{
  "message": "your warm, helpful reply in ${languageName}",
  "suggestions": ["follow-up question 1", "follow-up question 2"],
  "actions": [
    { "action": "open_page", "page": "contact" }
  ]
}
`;

const formatHistory = (history = []) => history.slice(-10).map((message) => ({
  role: message.role === 'assistant' ? 'assistant' : 'user',
  content: message.text || '',
}));

const normalizeResult = (result, originalMessage, language) => {
  const fallback = localConciergeFallback(originalMessage, language);

  return {
    message: typeof result.message === 'string' && result.message.trim()
      ? result.message.trim()
      : fallback.message,
    suggestions: asStringArray(result.suggestions).slice(0, 3),
    actions: normalizeActions(result.actions),
  };
};

const normalizeActions = (actions = []) => {
  if (!Array.isArray(actions)) return [];
  return actions
    .filter((action) => action && action.action === 'open_page' && PAGE_LINKS[action.page])
    .map((action) => ({ action: 'open_page', page: action.page, url: PAGE_LINKS[action.page] }))
    .slice(0, 3);
};

const localConciergeFallback = (message, language) => {
  const lang = toLanguageName(language) ? language : 'en';
  const lower = String(message || '').toLowerCase();

  const pageFor = (key) => PAGE_LINKS[key];

  if (/register|sign up|signup|create account|account|kwiyandikisha/i.test(lower)) {
    return {
      message: translate(lang, {
        en: "You can create a free account with your name, email, and password. It only takes a minute!",
        fr: "Vous pouvez créer un compte gratuit avec votre nom, e-mail et mot de passe. Cela prend une minute !",
        kin: "Ushobora gukora konti y'ubuntu ukoresheje izina ryawe, imeri n'ijambo ry'ibanga. Bigezweho mu minota mike!",
      }),
      suggestions: [
        translate(lang, { en: 'How do I log in?', fr: 'Comment me connecter ?', kin: 'Ninyura uburyo? ' }),
        translate(lang, { en: 'I forgot my password', fr: 'J\'ai oublié mon mot de passe', kin: 'Nibagiwe ijambo ry\'ibanga' }),
      ],
      actions: [{ action: 'open_page', page: 'register', url: pageFor('register') }],
    };
  }

  if (/login|log in|sign in|password|reset|forgot/i.test(lower)) {
    const forgot = /reset|forgot/i.test(lower);
    return {
      message: forgot
        ? translate(lang, {
            en: "No worries! On the login screen, choose 'Forgot password' and we'll send you a secure reset link by email.",
            fr: "Pas de souci ! Sur l'écran de connexion, choisissez 'Mot de passe oublié' et nous vous enverrons un lien sécurisé par e-mail.",
            kin: "Nta ngorane! Ku mwanya wo kwinjira, hitamo 'Nibagiwe ijambo ry\'ibanga' tukakugezaho umurongo wo gusanya ipereka ku imeri.",
          })
        : translate(lang, {
            en: "Log in with the email and password you used to register. You can also sign in with Google.",
            fr: "Connectez-vous avec l'e-mail et le mot de passe utilisés lors de l'inscription. Vous pouvez aussi utiliser Google.",
            kin: "Injira ukoresheje imeri n'ijambo ry'ibanga wifashishije. Usibye, ushobora kwinjira na Google.",
          }),
      suggestions: [
        translate(lang, { en: 'How do I sign up?', fr: 'Comment m\'inscrire ?', kin: 'Niyandikisha uburyo?' }),
        translate(lang, { en: 'Where are your branches?', fr: 'Où sont vos succursales ?', kin: 'Aho muli na filiali?' }),
      ],
      actions: [{
        action: 'open_page',
        page: forgot ? 'reset-password' : 'login',
        url: pageFor(forgot ? 'reset-password' : 'login'),
      }],
    };
  }

  if (/branch|location|where|store|shop|kilironko|kimironko|gishushu|heights|gikondo|utc/i.test(lower)) {
    return {
      message: translate(lang, {
        en: "We have branches across Kigali: UTC, Kigali Heights, Kimironko, Gishushu, and Gikondo. Pick a branch in the app to see live stock!",
        fr: "Nous avons des succursales à Kigali : UTC, Kigali Heights, Kimironko, Gishushu et Gikondo. Choisissez une succursale dans l'app pour voir le stock en direct !",
        kin: "Dufite amashami ya Simba mu Kigali: UTC, Kigali Heights, Kimironko, Gishushu na Gikondo. Hitamo ishami mu app kugirango ubone ibiri mu isoko.",
      }),
      suggestions: [
        translate(lang, { en: 'What are your opening hours?', fr: 'Quels sont vos horaires ?', kin: 'Mufungura ubwo?' }),
        translate(lang, { en: 'Do you deliver?', fr: 'Livrez-vous ?', kin: 'Mutanga ibicuruzwa?' }),
      ],
      actions: [{ action: 'open_page', page: 'branches', url: pageFor('branches') }],
    };
  }

  if (/deliver|delivery|shipping|ship|order|minim|minimum|pay|payment|momo|card/i.test(lower)) {
    return {
      message: translate(lang, {
        en: "We deliver across Kigali daily from 7 AM to 10 PM. The minimum order is 2,500 RWF. You can pay with Mobile Money or card. Track orders in 'My Orders'.",
        fr: "Nous livrons à Kigali tous les jours de 7h à 22h. La commande minimale est de 2 500 RWF. Paiement par Mobile Money ou carte. Suivez vos commandes dans 'Mes commandes'.",
        kin: "Dutanga ibicuruzwa mu Kigali buri munsi kuva saa 7 za mu gitondo kugeza saa 4 z'ijoro. Itondeko rito ni RWF 2,500. Ushobora kwishyura na MoMo cyangwa card. Kurikirana itondeko ryawe kuri 'Amatora yanjye'.",
      }),
      suggestions: [
        translate(lang, { en: 'How do I track my order?', fr: 'Comment suivre ma commande ?', kin: 'Nkurikirana itondeko ryanjye?' }),
        translate(lang, { en: 'What is your returns policy?', fr: 'Quelle est votre politique de retours ?', kin: 'Politiki yanyu y\'isubizo?' }),
      ],
      actions: [{ action: 'open_page', page: 'orders', url: pageFor('orders') }],
    };
  }

  if (/return|refund|damaged|wrong|missing|cancel/i.test(lower)) {
    return {
      message: translate(lang, {
        en: "If something is wrong, damaged, or missing, contact our team with your order ID and we'll sort out a refund or replacement.",
        fr: "Si quelque chose ne va pas, est endommagé ou manquant, contactez notre équipe avec votre ID de commande et nous gérerons un remboursement ou un remplacement.",
        kin: "Niba hari ikintu kidakora, cyangwa cyabuze, vugana n'itsinda ryacu utange ID y'itondéko ryawe turasubiza cyangwa tugatanga indi.",
      }),
      suggestions: [
        translate(lang, { en: 'Contact support', fr: 'Contacter le support', kin: 'Vugana n\'abakora' }),
        translate(lang, { en: 'Shipping policy', fr: 'Politique de livraison', kin: 'Politiki y\'iperereza' }),
      ],
      actions: [{ action: 'open_page', page: 'returns', url: pageFor('returns') }],
    };
  }

  if (/contact|support|help|talk|agent|human/i.test(lower)) {
    return {
      message: translate(lang, {
        en: "Our team is happy to help! Reach us through the Contact page and we'll get back to you quickly.",
        fr: "Notre équipe est ravie de vous aider ! Contactez-nous via la page Contact et nous reviendrons vers vous rapidement.",
        kin: "Itsinda ryacu rishimira kugufasha! Twige ku rupapuro rwa Contact turasubiza vuba.",
      }),
      suggestions: [
        translate(lang, { en: 'FAQs', fr: 'FAQ', kin: 'Ibibazo bisanzwe' }),
        translate(lang, { en: 'Track my order', fr: 'Suivre ma commande', kin: 'Kurikirana itondeko' }),
      ],
      actions: [{ action: 'open_page', page: 'contact', url: pageFor('contact') }],
    };
  }

  if (/hi|hello|hey|muraho|bonjour|amakuru|good morning|good afternoon/i.test(lower)) {
    return {
      message: translate(lang, {
        en: "Muraho! I'm Simba, your concierge. Ask me about our branches, your account, deliveries, or anything about Simba Supermarket.",
        fr: "Bonjour ! Je suis Simba, votre concierge. Posez-moi des questions sur nos succursales, votre compte, les livraisons ou tout sur Simba Supermarket.",
        kin: "Muraho! Ndi Simba, umukozi wawe. Mbibaze kuri filiali zacu, konti yawe, ibicuruzwa, cyangwa ikindi kiri kuri Simba Supermarket.",
      }),
      suggestions: [
        translate(lang, { en: 'Where are your branches?', fr: 'Où sont vos succursales ?', kin: 'Aho muli na filiali?' }),
        translate(lang, { en: 'How do I create an account?', fr: 'Comment créer un compte ?', kin: 'Nkora uburyo konti?' }),
        translate(lang, { en: 'Do you deliver?', fr: 'Livrez-vous ?', kin: 'Mutanga ibicuruzwa?' }),
      ],
      actions: [],
    };
  }

  return {
    message: translate(lang, {
      en: "I'm Simba, your concierge for Simba Supermarket. I can help with branches, opening hours, your account, deliveries, payments, returns, and contacting support. What would you like to know?",
      fr: "Je suis Simba, votre concierge pour Simba Supermarket. Je peux aider pour les succursales, horaires, compte, livraisons, paiements, retours et le support. Que souhaitez-vous savoir ?",
      kin: "Ndi Simba, umukozi wawe wa Simba Supermarket. Nshobora kugufasha kuri filiali, amasaha, konti yawe, ibicuruzwa, kwishyura, isubizo n'ubufasha. Wifuza kumenya iki?",
    }),
    suggestions: [
      translate(lang, { en: 'Where are your branches?', fr: 'Où sont vos succursales ?', kin: 'Aho muli na filiali?' }),
      translate(lang, { en: 'How do I reset my password?', fr: 'Comment réinitialiser mon mot de passe ?', kin: 'Nasanya uburyo ijambo ry\'ibanga?' }),
      translate(lang, { en: 'Do you deliver?', fr: 'Livrez-vous ?', kin: 'Mutanga ibicuruzwa?' }),
    ],
    actions: [],
  };
};

const translate = (language, values) => values[language] || values.en;

const asStringArray = (value) =>
  Array.isArray(value) ? value.map(String).filter(Boolean) : [];

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    const match = String(value || '').match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
};

module.exports = {
  askConcierge,
};
