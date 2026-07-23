const OLLAMA       = process.env.OLLAMA_URL   || 'http://localhost:11434'
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_MODEL   = process.env.GROQ_MODEL   || 'openai/gpt-oss-120b'

function extractJSON(content) {
  content = content.replace(/^```(?:json)?\s*/gm, '').replace(/\s*```$/gm, '')
  const m = content.match(/\{[\s\S]+\}/u)
  if (m) content = m[0]
  try { return JSON.parse(content) } catch { return null }
}

/* ── Groq (cloud, OpenAI-compatible) ── */
async function groqChat(messages, { numPredict, temperature = 0.15 }) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        messages,
        max_tokens:  numPredict,
        temperature,
        /* gpt-oss est un modèle "reasoning" : sans ça, son raisonnement interne
           peut fuiter dans le contenu et casser l'extraction JSON. */
        ...(GROQ_MODEL.startsWith('openai/gpt-oss')
          ? { reasoning_effort: 'low', include_reasoning: false }
          : {}),
      }),
      signal: AbortSignal.timeout(120000),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Groq error:', err)
      return null
    }
    const data = await res.json()
    return extractJSON(data.choices?.[0]?.message?.content ?? '')
  } catch (e) {
    console.error('groqChat exception:', e)
    return null
  }
}

/* ── Ollama (local) ── */
async function ollamaChat(model, messages, { numPredict, numCtx, timeout, temperature = 0.15 }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout * 1000)
  try {
    const res = await fetch(`${OLLAMA}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, messages, stream: false, keep_alive: 0,
        options: { temperature, num_predict: numPredict, num_ctx: numCtx },
      }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const data = await res.json()
    return extractJSON(data.message?.content ?? '')
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/* ── Dispatcher : Groq si clé dispo, sinon Ollama ── */
function callAI(model, messages, opts) {
  return GROQ_API_KEY
    ? groqChat(messages, opts)
    : ollamaChat(model, messages, opts)
}

function slimCV(cv) {
  const { photo: _p, photoUrl: _pu, photoFile: _pf, ...personal } = cv.personal ?? {}
  return {
    personal,
    experiences: (cv.experiences ?? []).map(({ id, poste, entreprise, debut, fin, description }) =>
      ({ id, poste, entreprise, debut, fin, description })),
    competences: (cv.competences ?? []).map(({ id, nom, niveau }) => ({ id, nom, niveau })),
    formations:  (cv.formations  ?? []).map(({ id, diplome, ecole, debut, fin }) =>
      ({ id, diplome, ecole, debut, fin })),
    langues:  cv.langues  ?? [],
    qualites: cv.qualites ?? [],
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  /* ── GET ?action=models ── */
  if (req.method === 'GET' && req.query.action === 'models') {
    if (GROQ_API_KEY) {
      return res.json({ models: [GROQ_MODEL], provider: 'groq' })
    }
    try {
      const r = await fetch(`${OLLAMA}/api/tags`, { signal: AbortSignal.timeout(5000) })
      if (!r.ok) throw new Error()
      const data = await r.json()
      return res.json({ models: (data.models ?? []).map(m => m.name), provider: 'ollama' })
    } catch {
      return res.status(503).json({ error: 'Ollama non disponible. Lancez : ollama serve' })
    }
  }

  const body   = req.body ?? {}
  const cv     = body.cv ?? {}
  const model  = (body.model  ?? 'mistral').trim()
  const action = (body.action ?? req.query.action ?? 'adapt').trim()

  /* ── AGENT 1 — parse : texte brut → JSON structuré ── */
  if (action === 'parse') {
    const cvText = (body.cvText ?? '').trim().slice(0, 5000)
    if (cvText.length < 30) return res.status(400).json({ error: 'Texte trop court.' })

    const system = `Tu es un expert en lecture et extraction de CV professionnels.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ou après.

Règles strictes :
- Le texte peut être désordonné (PDF 2 colonnes) : cherche l'info partout dans le texte
- Sépare TOUJOURS prénom et nom de famille en deux champs distincts
- Le prénom est généralement en MAJUSCULES ou avant le nom de famille
- Ne génère JAMAIS d'information absente du texte source
- Si un champ est absent : chaîne vide "" — jamais null
- Niveaux compétences selon contexte : "Débutant" | "Intermédiaire" | "Avancé" | "Expert"
- Dates : normalise en "2022" ou "jan. 2022" ou "présent"
- Le résumé/profil est le paragraphe descriptif de présentation, reproduis-le fidèlement
- Compétences : liste TOUS les outils, langages, frameworks mentionnés
- Si une ligne contient plusieurs compétences séparées par des virgules ou des tirets, crée une entrée par compétence
- Qualités : extrais les soft skills et qualités personnelles
- Passions/hobbies : liste les centres d'intérêt`

    const result = await callAI(model, [
      { role: 'system', content: system },
      { role: 'user',   content: `## TEXTE BRUT DU CV (peut être désordonné si PDF 2 colonnes)\n${cvText}\n\n## FORMAT JSON STRICT — RIEN D'AUTRE\n{"personal":{"prenom":"","nom":"","headline":"","email":"","telephone":"","resume":"","localisation":"","github":""},"experiences":[{"poste":"","entreprise":"","debut":"","fin":"","description":""}],"formations":[{"diplome":"","ecole":"","debut":"","fin":"","description":""}],"competences":[{"nom":"","niveau":""}],"qualites":[{"nom":""}],"langues":[{"nom":"","niveau":""}],"passions":[{"nom":""}]}` },
    ], { numPredict: 1000, numCtx: 4096, timeout: 360, temperature: 0.1 })

    if (!result) return res.status(503).json({ error: 'Ollama ne répond pas (parse).' })
    return res.json(result)
  }

  /* ── AGENT 2 — extract_job : offre texte → exigences JSON ── */
  if (action === 'extract_job') {
    const offerText = (body.jobOffer ?? '').trim().slice(0, 3000)
    if (offerText.length < 20) return res.status(400).json({ error: "Texte de l'offre trop court." })

    const system = `Tu es un recruteur senior expert en analyse d'offres d'emploi.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ou après.

Règles strictes :
- Distingue compétences OBLIGATOIRES (stack_obligatoire) et SOUHAITÉES (stack_souhaitee)
- Extrais UNIQUEMENT les informations EXPLICITEMENT présentes dans l'offre
- Ne déduis PAS de compétences implicites (si React est mentionné, n'ajoute pas JS sauf si écrit)
- Garde le wording EXACT de l'offre pour experience_requise
- Si une info est absente : chaîne vide ""`

    const result = await callAI(model, [
      { role: 'system', content: system },
      { role: 'user',   content: `## OFFRE D'EMPLOI\n${offerText}\n\n## FORMAT JSON STRICT — RIEN D'AUTRE\n{"poste":"","entreprise":"","secteur":"","contrat":"","localisation":"","experience_requise":"","niveau_etudes":"","stack_obligatoire":[],"stack_souhaitee":[],"soft_skills":[],"missions_principales":[]}` },
    ], { numPredict: 400, numCtx: 2048, timeout: 240, temperature: 0.1 })

    if (!result) return res.status(503).json({ error: 'Ollama ne répond pas (extract_job).' })
    return res.json(result)
  }

  /* ── AGENT 2b — analyze : qualité CV (sans offre) ── */
  if (action === 'analyze') {
    const cvSlim = slimCV(cv)
    const cvJson = JSON.stringify(cvSlim, null, 2)

    const result = await callAI(model, [
      { role: 'system', content: 'Tu es un expert RH senior et coach carrière.\nTu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ou après.' },
      { role: 'user',   content: `## CV À ANALYSER (JSON)\n${cvJson}\n\n## MISSION\n1. Score de qualité global (0–100) : clarté, exhaustivité, impact des descriptions, cohérence.\n2. 3 à 5 points forts (ce qui est bien fait).\n3. 3 à 5 points faibles ou axes d'amélioration concrets.\n4. 3 à 5 suggestions d'amélioration actionnables et précises.\n5. Sections importantes manquantes ou trop courtes.\n\n## FORMAT JSON STRICT — RIEN D'AUTRE\n{"score":68,"points_forts":[],"points_faibles":[],"suggestions":[],"sections_manquantes":[]}` },
    ], { numPredict: 512, numCtx: 3072, timeout: 300, temperature: 0.3 })

    if (!result) return res.status(503).json({ error: 'Ollama ne répond pas (analyze).' })
    return res.json(result)
  }

  /* ── AGENT 3 — adapt : CV + exigences → CV adapté ── */
  if (action === 'adapt') {
    let { jobRequirements } = body
    const jobOfferRaw = (body.jobOffer ?? '').trim()

    if (!jobRequirements && !jobOfferRaw) {
      return res.status(400).json({ error: 'jobRequirements ou jobOffer requis.' })
    }

    /* fallback : extraction inline si exigences pas encore extraites */
    if (!jobRequirements) {
      const offerText = jobOfferRaw.slice(0, 3000)
      jobRequirements = await callAI(model, [
        { role: 'system', content: 'Tu es un recruteur expert. JSON uniquement, sans markdown.' },
        { role: 'user',   content: `## OFFRE\n${offerText}\n\n## FORMAT JSON\n{"poste":"","stack_obligatoire":[],"stack_souhaitee":[],"soft_skills":[],"experience_requise":"","niveau_etudes":"","missions_principales":[]}` },
      ], { numPredict: 350, numCtx: 2048, timeout: 240, temperature: 0.1 })

      if (!jobRequirements) {
        return res.status(503).json({ error: 'Échec extraction offre (Agent 2 fallback).' })
      }
    }

    const cvSlim       = slimCV(cv)
    const cvJson       = JSON.stringify(cvSlim,          null, 2)
    const exigencesJson = JSON.stringify(jobRequirements, null, 2)

    const system = `Tu es un expert en optimisation de CV et en marketing personnel.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ou après.

RÈGLES ABSOLUES — HALLUCINATION INTERDITE :
1. Ne JAMAIS inventer une expérience, un diplôme, une compétence ou une date absente du CV source
2. Tu peux UNIQUEMENT : reformuler, réordonner, mettre en avant, adapter le vocabulaire
3. Pour chaque expérience reformulée : même entreprise, mêmes dates, mêmes faits — seule la formulation change
4. Compétences absentes → missing_skills UNIQUEMENT, jamais ajoutées au CV
5. Score honnête (0-100) basé sur la réelle correspondance, pas optimiste
6. Utilise les mots-clés EXACTS de l'offre dans les reformulations quand c'est justifié`

    const result = await callAI(model, [
      { role: 'system', content: system },
      { role: 'user',   content: `## EXIGENCES DU POSTE (JSON — extrait par Agent 2)\n${exigencesJson}\n\n## CV DU CANDIDAT (JSON)\n${cvJson}\n\n## MISSION\n1. Réécris personal.resume : mets en avant les points qui matchent l'offre (max 500 car.).\n2. Adapte personal.headline au poste si pertinent, sinon conserve-le.\n3. Pour chaque expérience : reformule description avec les mots-clés du poste (garde les faits).\n4. Réordonne competences : stack_obligatoire en premier, puis stack_souhaitee, puis reste.\n5. Score de correspondance (0–100) honnête.\n6. Compétences du poste absentes du CV → missing_skills (max 8).\n7. Pour chaque item de stack_obligatoire, stack_souhaitee, soft_skills, experience_requise :\n   indique si couvert par le CV avec une courte explication.\n\n## FORMAT JSON STRICT — RIEN D'AUTRE\n{"score":72,"missing_skills":[],"headline":"","resume":"","experiences":[{"id":"ID_EXACT_DU_CV","description":""}],"competences":[{"id":"ID_EXACT_DU_CV","nom":"","niveau":""}],"comparaison":[{"exigence":"","present":true,"detail":""}]}` },
    ], { numPredict: 900, numCtx: 4096, timeout: 540, temperature: 0.2 })

    if (!result) return res.status(500).json({ error: 'Agent 3 (adapt) : JSON invalide ou timeout.' })
    return res.json(result)
  }

  return res.status(400).json({ error: `Action inconnue : ${action}` })
}
