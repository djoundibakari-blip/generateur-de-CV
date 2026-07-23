// Source de vérité unique pour le pricing — importée côté API ET côté front.

export const FEATURES = {
  IMPORT_CV: 'import_cv',
  AI_PARSE: 'ai_parse',
  AI_ANALYZE: 'ai_analyze',
  AI_EXTRACT_JOB: 'ai_extract_job',
  AI_ADAPT: 'ai_adapt',
  SCRAPING: 'scraping',
  COVER_LETTER: 'cover_letter',
}

const FREE_FEATURES = []
const STANDARD_FEATURES = [
  FEATURES.IMPORT_CV,
  FEATURES.AI_PARSE,
  FEATURES.AI_ANALYZE,
  FEATURES.AI_EXTRACT_JOB,
  FEATURES.AI_ADAPT,
]
const INTERMEDIATE_FEATURES = [...STANDARD_FEATURES, FEATURES.SCRAPING]
const PREMIUM_FEATURES = [...INTERMEDIATE_FEATURES, FEATURES.COVER_LETTER]

export const PLANS = {
  FREE: {
    key: 'FREE',
    name: 'Gratuit',
    priceMonthly: 0,
    monthlyCredits: 0,
    features: FREE_FEATURES,
  },
  STANDARD: {
    key: 'STANDARD',
    name: 'Standard',
    priceMonthly: 900,
    monthlyCredits: 30,
    features: STANDARD_FEATURES,
  },
  INTERMEDIATE: {
    key: 'INTERMEDIATE',
    name: 'Intermédiaire',
    priceMonthly: 1900,
    monthlyCredits: 60,
    features: INTERMEDIATE_FEATURES,
  },
  PREMIUM: {
    key: 'PREMIUM',
    name: 'Premium',
    priceMonthly: 2900,
    monthlyCredits: 100,
    features: PREMIUM_FEATURES,
  },
}

// Action de l'endpoint /api/ollama → feature requise pour l'appeler
export const ACTION_FEATURE_MAP = {
  parse: FEATURES.AI_PARSE,
  analyze: FEATURES.AI_ANALYZE,
  extract_job: FEATURES.AI_EXTRACT_JOB,
  adapt: FEATURES.AI_ADAPT,
  cover_letter: FEATURES.COVER_LETTER,
}

export function planForFeature(featureKey) {
  return Object.values(PLANS).find((p) => p.features.includes(featureKey)) ?? null
}
