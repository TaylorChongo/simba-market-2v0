/**
 * Detects the language of a piece of text, supporting English, French and
 * Kinyarwanda. Used as a fallback for offline responses and — more importantly —
 * to tell the LLM exactly which language to reply in, since low-resource
 * languages like Kinyarwanda are easy for the model to miss without an explicit
 * hint.
 *
 * @param {string} text - The text to inspect.
 * @param {string} fallback - Language to assume when detection is inconclusive.
 * @returns {'en' | 'fr' | 'kin'}
 */
const detectLanguage = (text = '', fallback = 'en') => {
  const lower = String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (!lower.trim()) return fallback || 'en';

  // Kinyarwanda is detected first because its characteristic letter combinations
  // (rw, cy, shy, nyi, ndy, ntu, mwa, etc.) almost never appear in English or
  // French. Word markers cover common conversational phrasing.
  const kinyarwanda = /(rw|cy|shy|nyi|ndy|ntu|mwa|ngw|zwi|mb[aeiouy]|mv[aeiouy]|mp[aeiouy]|mf[aeiouy]|nka|nta|ura|turi|muri|twese|iyi|uyu|muraho|amakuru|ndashaka|nshaka|ukeneye|keneye|ngomba|nshimye|murakoze|urakoze|twandikire|kugira|kubaza|nkunda|nibura|nimura|mwiriwe|mubyumva|ndabaza|ibicuruzwa|kwishyura|ishyura|filiali|konti|amata|umuceri|icyayi|isoko|itondeko|guhatanira|ngomba|wowe|twebwe|mwebwe|ndagufasha|ndumva|umva|tugire|dufite|mufite|bagira|kubera|kuki|niwo|nya|ndetse|byose|byiza|gusaba|gusubiza|kwiyandikisha|kwiyandikishwa|ibiciro|igiciro|iperereza|gutanga|gutuza|kuzuza|guhesha|vugana|inyura|yinjira|abakora|mubaze|tubaze|dukore|ukora|onshyiramo|ongeramo)/i;
  if (kinyarwanda.test(lower)) return 'kin';

  // French markers: accented characters or French function/content words
  const french = /[àâçéèêëîïôùûüÿæœ]|(^|\s)(bonjour|salut|merci|besoin|chercher|ajouter|comment|pouvez|magasin|livraison|commande|succursale|ouverture|heures|s'il|sil\s|français|francais|réinitialiser|réinitialisation|mot de passe|je\s|le\s|la\s|les\s|vous|votre|notre|pour|avec|une\s|j'ai|jai|est|au|aux|en\s|de\s|du\s|des\s|que|qui|pas|rien|tout|comment)/i;
  if (french.test(lower)) return 'fr';

  // English (and any unsupported input) is the default
  return fallback || 'en';
};

const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'French',
  kin: 'Kinyarwanda',
};

const toLanguageName = (language) => LANGUAGE_NAMES[language] || LANGUAGE_NAMES.en;

module.exports = {
  detectLanguage,
  toLanguageName,
  LANGUAGE_NAMES,
};
