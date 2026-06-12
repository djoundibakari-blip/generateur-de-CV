const mkId = () => Math.random().toString(36).slice(2)

/* ── Section headers (FR + EN) ── */
const SECTION_RE = {
  profile: /^(profil|profile|résumé professionnel?|professional summary|summary|about|à propos|présentation|objective)\s*:?\s*$/i,
  experience: /^(expériences? professionnelles?|expériences?|professional experience|work experience|parcours|emplois?|career)\s*:?\s*$/i,
  education: /^(formations?|education|diplômes?|études|cursus|scolarité|academic)\s*:?\s*$/i,
  skills: /^(compétences?(?:\s+(?:techniques?|clés|informatiques?))?|skills?|technologies|langages?|outils|savoir-faire)\s*:?\s*$/i,
}

/* ── Date range pattern ── */
const DATE_RANGE_RE = /(?:(?:jan\w*|fév\w*|mar\w*|avr\w*|mai|juin|juil\w*|aoû?\w*|sep\w*|oct\w*|nov\w*|déc\w*|jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)\s+)?\d{4}\s*[-–→/àa]\s*(?:(?:jan\w*|fév\w*|mar\w*|avr\w*|mai|juin|juil\w*|aoû?\w*|sep\w*|oct\w*|nov\w*|déc\w*|jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)\s+)?\d{4}|(?:présent|actuel|aujourd'hui|en cours|current|now)/gi

const MONTH_MAP = {
  jan: '01', fév: '02', feb: '02', mar: '03', avr: '04', apr: '04',
  mai: '05', may: '05', juin: '06', jun: '06', juil: '07', jul: '07',
  aoû: '08', aug: '08', sep: '09', oct: '10', nov: '11', déc: '12', dec: '12',
}

function toMonthInput(raw) {
  if (!raw) return ''
  raw = raw.trim().toLowerCase()
  if (/présent|actuel|cours|current|now/.test(raw)) return ''
  const mMatch = raw.match(/([a-zéû]+)\s+(\d{4})/)
  if (mMatch) {
    const m = MONTH_MAP[mMatch[1].slice(0, 3)] || '01'
    return `${mMatch[2]}-${m}`
  }
  const yMatch = raw.match(/\d{4}/)
  return yMatch ? `${yMatch[0]}-01` : ''
}

function parseDateRange(str) {
  const parts = str.split(/[-–→/àa]/).map(s => s.trim())
  return { debut: toMonthInput(parts[0]), fin: toMonthInput(parts[1] || '') }
}

/* ── Contact extraction ── */
function extractContact(text) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)?.[0] || ''
  const phone = text.match(/(?:\+33\s?|0)[1-9](?:[\s.\-]?\d{2}){4}/)?.[0]?.trim() || ''
  return { email, telephone: phone }
}

/* ── Name extraction (first title-case 2–5 word line) ── */
function extractName(lines) {
  const skip = /[@http|linkedin|github|tel:|phone:|mail:|\d{5,}]/i
  const stop = /^(profil|expérience|formation|compétence|skill|education)/i
  for (const line of lines.slice(0, 10)) {
    if (skip.test(line) || stop.test(line)) continue
    const words = line.split(/\s+/).filter(Boolean)
    if (words.length < 2 || words.length > 5) continue
    if (words.every(w => /^[A-ZÀÁÂÉÈÊËÎÏÔÙÛÜ][a-zA-ZÀ-ÿ'-]+$/.test(w))) {
      return { prenom: words[0], nom: words.slice(1).join(' ') }
    }
  }
  return { prenom: '', nom: '' }
}

/* ── Headline: first short line after name that isn't contact info ── */
function extractHeadline(lines, name) {
  if (!name.prenom) return ''
  const idx = lines.findIndex(l => l.includes(name.prenom))
  for (const l of lines.slice(idx + 1, idx + 5)) {
    if (l.length > 5 && l.length < 90 && !/@/.test(l) && !/\d{6,}/.test(l)) return l
  }
  return ''
}

/* ── Split text into named sections ── */
function splitSections(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const sections = { header: [], profile: [], experience: [], education: [], skills: [] }
  let current = 'header'
  for (const line of lines) {
    let hit = false
    for (const [key, re] of Object.entries(SECTION_RE)) {
      if (re.test(line)) { current = key; hit = true; break }
    }
    if (!hit) sections[current].push(line)
  }
  return sections
}

/* ── Parse experience / education blocks ── */
function parseEntries(lines, isEdu = false) {
  const entries = []
  let cur = null

  for (const line of lines) {
    const dateMatch = line.match(DATE_RANGE_RE)
    if (dateMatch) {
      if (cur) entries.push(cur)
      const { debut, fin } = parseDateRange(dateMatch[0])
      const rest = line.replace(dateMatch[0], '').replace(/[-–|]/g, '').trim()
      cur = isEdu
        ? { id: mkId(), diplome: rest, ecole: '', debut, fin, description: '' }
        : { id: mkId(), poste: rest, entreprise: '', debut, fin, description: '' }
    } else if (cur) {
      const titleKey  = isEdu ? 'diplome' : 'poste'
      const orgKey    = isEdu ? 'ecole'   : 'entreprise'
      if (!cur[titleKey] && line.length < 80) {
        cur[titleKey] = line
      } else if (!cur[orgKey] && line.length < 80) {
        cur[orgKey] = line
      } else {
        cur.description += (cur.description ? ' ' : '') + line
      }
    } else {
      /* no date yet — try to detect a "Poste — Entreprise" pattern */
      const sep = line.match(/^(.+?)\s*[–|—]\s*(.+)$/)
      if (sep && sep[1].length < 60 && sep[2].length < 60) {
        cur = isEdu
          ? { id: mkId(), diplome: sep[1].trim(), ecole: sep[2].trim(), debut: '', fin: '', description: '' }
          : { id: mkId(), poste: sep[1].trim(), entreprise: sep[2].trim(), debut: '', fin: '', description: '' }
      }
    }
  }
  if (cur) entries.push(cur)
  return entries.filter(e => isEdu ? (e.diplome || e.ecole) : (e.poste || e.entreprise))
}

/* ── Parse skills ── */
function parseSkills(lines) {
  const raw = lines.join(' , ')
  const items = raw
    .split(/[,;•·\-\n|\/]/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 50 && !/^(compétences?|skills?)/i.test(s))
  const seen = new Set()
  return items
    .filter(s => { if (seen.has(s.toLowerCase())) return false; seen.add(s.toLowerCase()); return true })
    .slice(0, 20)
    .map(nom => ({ id: mkId(), nom, niveau: '' }))
}

/* ── Main export ── */
export function parseCV(text) {
  const sec = splitSections(text)
  const contact = extractContact(text)
  const name = extractName(sec.header.length > 0 ? sec.header : text.split('\n').map(l => l.trim()))
  const headline = extractHeadline(text.split('\n').map(l => l.trim()), name)
  const resume = sec.profile.join(' ').slice(0, 600)

  return {
    personal: {
      prenom: name.prenom, nom: name.nom,
      headline, resume,
      email: contact.email, telephone: contact.telephone,
      photoUrl: null, photoFile: null,
    },
    experiences: parseEntries(sec.experience, false),
    formations:  parseEntries(sec.education,  true),
    competences: parseSkills(sec.skills),
  }
}
