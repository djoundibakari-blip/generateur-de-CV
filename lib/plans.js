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

// `priceMonthly` = montant en centimes facturé à chaque cycle (voir `billingPeriod`,
// 'monthly' par défaut). Plafond produit : jamais plus de 66700 (667€), quel que soit le plan.
export const PLANS = {
  FREE: {
    key: 'FREE',
    name: 'Gratuit',
    tagline: 'Pour créer un CV manuellement (le seul tarif encore raisonnable)',
    priceMonthly: 0,
    billingPeriod: 'monthly',
    monthlyCredits: 0,
    features: FREE_FEATURES,
  },
  STANDARD: {
    key: 'STANDARD',
    name: 'Standard',
    tagline: 'Génération de CV par IA (moins cher qu’un coach LinkedIn, à peine)',
    priceMonthly: 4900,
    billingPeriod: 'monthly',
    monthlyCredits: 30,
    features: STANDARD_FEATURES,
  },
  INTERMEDIATE: {
    key: 'INTERMEDIATE',
    name: 'Intermédiaire',
    tagline: 'IA + extraction automatique des offres (le prix d’un stage, mais vous payez)',
    priceMonthly: 14900,
    billingPeriod: 'monthly',
    monthlyCredits: 60,
    features: INTERMEDIATE_FEATURES,
  },
  PREMIUM: {
    key: 'PREMIUM',
    name: 'Premium',
    tagline: "CV + lettre de motivation sur-mesure. Facturé au trimestre, pile pendant les pics de recrutement en alternance (0% de garantie d’embauche incluse)",
    // 667€ / trimestre — le plafond, jamais dépassé. Facturation trimestrielle
    // calée sur les vagues de recrutement en alternance en France (recherche
    // de rentrée : févr.-juil., rattrapage : août-sept.), pas mensuelle.
    priceMonthly: 66700,
    billingPeriod: 'quarterly',
    monthlyCredits: 100,
    features: PREMIUM_FEATURES,
  },
}

// Ordre d'affichage (Object.values suffirait déjà, mais explicite = plus sûr si l'ordre des clés change)
export const PLAN_ORDER = ['FREE', 'STANDARD', 'INTERMEDIATE', 'PREMIUM']

// Libellés lisibles des features, pour l'affichage (tarifs, badges d'upsell, etc.)
export const FEATURE_LABELS = {
  [FEATURES.IMPORT_CV]: 'Import de CV (fichier / drag-and-drop)',
  [FEATURES.AI_PARSE]: 'Remplissage automatique par IA',
  [FEATURES.AI_ANALYZE]: 'Analyse de qualité du CV',
  [FEATURES.AI_EXTRACT_JOB]: "Analyse d'une offre d'emploi (texte collé)",
  [FEATURES.AI_ADAPT]: 'Adaptation du CV au poste',
  [FEATURES.SCRAPING]: "Extraction automatique d'offre via URL",
  [FEATURES.COVER_LETTER]: 'Génération de lettre de motivation',
}

// Liste ordonnée pour l'affichage des lignes de comparaison sur la page tarifs
export const FEATURE_DISPLAY_ORDER = [
  FEATURES.IMPORT_CV,
  FEATURES.AI_PARSE,
  FEATURES.AI_ANALYZE,
  FEATURES.AI_EXTRACT_JOB,
  FEATURES.AI_ADAPT,
  FEATURES.SCRAPING,
  FEATURES.COVER_LETTER,
]

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
