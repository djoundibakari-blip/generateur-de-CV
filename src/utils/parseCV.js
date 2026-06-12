const mkId = () => Math.random().toString(36).slice(2)

/* ── Strip decorative non-word chars for section matching ── */
function cleanLine(line) {
  return line
    .replace(/[^\w\sàâäéèêëîïôùûüçÀÂÄÉÈÊËÎÏÔÙÛÜÇ''-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ── Strip "......" dots used as visual separators ── */
function stripDots(str) {
  return str.replace(/\.{3,}/g, ' ').replace(/\s+/g, ' ').trim()
}

/* ── Section headers (FR + EN + decorated) ── */
const SECTION_RE = {
  profile:    /^(profil|profile|résumé professionnel?|professional summary|summary|about|à propos|présentation|objective)/i,
  experience: /^(expériences? professionnelles?|expériences?|professional experience|work experience|parcours|emplois?|career)/i,
  education:  /^(formations?|education|diplômes?|études|cursus|scolarité|academic)/i,
  skills:     /^(compétences?(?:\s+(?:techniques?|clés|informatiques?))?|skills?|technologies|langages?|outils|savoir-faire|informatique)/i,
  qualites:   /^(qualités?(?:\s+(?:personnelles?|professionnelles?))?|soft skills?|aptitudes?|atouts?|savoir-être)/i,
  langues:    /^(langues?|languages?|langue vivante|linguistic)/i,
  passions:   /^(passions?|loisirs?|hobbies?|centres? d.intérêts?|intérêts?|activités?(?:\s+extra-?professionnelles?)?)/i,
}

/* ── Date patterns ── */
const MONTH_FR = 'jan\\w*|fév\\w*|mar\\w*|avr\\w*|mai|juin|juil\\w*|ao[uû]\\w*|sep\\w*|oct\\w*|nov\\w*|déc\\w*'
const MONTH_EN = 'jan\\w*|feb\\w*|mar\\w*|apr\\w*|may|jun\\w*|jul\\w*|aug\\w*|sep\\w*|oct\\w*|nov\\w*|dec\\w*'
const MONTH_ALL = `${MONTH_FR}|${MONTH_EN}`
const YEAR = '\\d{4}'
const SEP  = '[-–→/àa]|\\s+à\\s+|\\s+au\\s+|\\s+et\\s+'

// Matches: "Jan 2020 - Jan 2022", "2019-2022", "Depuis Jan 2020", "présent"
const DATE_RANGE_RE = new RegExp(
  `(?:depuis\\s+)?(?:(?:${MONTH_ALL})\\s+)?${YEAR}\\s*(?:${SEP})\\s*(?:(?:${MONTH_ALL})\\s+)?${YEAR}` +
  `|(?:depuis\\s+(?:(?:${MONTH_ALL})\\s+)?${YEAR})` +
  `|(?:présent|actuel|aujourd'hui|en cours|current|now)`,
  'gi'
)

const MONTH_MAP = {
  jan: '01', fév: '02', feb: '02', fev: '02', mar: '03', avr: '04', apr: '04',
  mai: '05', may: '05', juin: '06', jun: '06', juil: '07', jul: '07',
  aou: '08', aoû: '08', aug: '08', sep: '09', oct: '10', nov: '11', déc: '12', dec: '12',
}

function toMonthInput(raw) {
  if (!raw) return ''
  raw = raw.trim().toLowerCase().replace(/^depuis\s+/, '')
  if (/présent|actuel|cours|current|now/.test(raw)) return ''
  const mMatch = raw.match(/([a-zéûô]+)\s+(\d{4})/)
  if (mMatch) {
    const key = mMatch[1].slice(0, 3).normalize('NFD').replace(/[̀-ͯ]/g, '')
    const m = MONTH_MAP[key] || MONTH_MAP[mMatch[1].slice(0, 3)] || '01'
    return `${mMatch[2]}-${m}`
  }
  const yMatch = raw.match(/\d{4}/)
  return yMatch ? `${yMatch[0]}-01` : ''
}

function parseDateRange(str) {
  // "Depuis Juin 2008" → start date only, no end
  const sinceMatch = str.match(/^depuis\s+/i)
  const parts = str.split(new RegExp(SEP, 'i')).map(s => s.trim())
  const debut = toMonthInput(parts[0])
  const fin   = parts[1] ? toMonthInput(parts[1]) : (sinceMatch ? '' : '')
  return { debut, fin }
}

function extractContact(text) {
  const email = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)?.[0] || ''
  const phone = text.match(/(?:\+33\s?|0)[1-9](?:[\s.\-]?\d{2}){4}/)?.[0]?.trim() || ''
  return { email, telephone: phone }
}

function extractGithub(text) {
  const m = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w.-]+(?:\/[\w.-]+)?/i)
  return m ? m[0].replace(/^https?:\/\/(www\.)?/, '') : ''
}

function extractLocation(text) {
  const lines = text.split('\n').map(l => l.trim())
  for (const line of lines.slice(0, 25)) {
    if (/(?:mobilité|mobile|localisation|adresse|ville|city)\s*[:–-]/i.test(line)) {
      return line.replace(/.*?[:–-]\s*/, '').trim().slice(0, 60)
    }
    // "Lyon / MOBILITÉ FRANCE" or "Lyon (69)"
    if (/^[A-ZÀÁÂÉÈÊÎÏÔÙÛ][a-zàáâéèêîïôùû]+(?:\s*[/(]\s*(?:MOBILITÉ|Mobilité|FRANCE|France|\d{2}))?$/.test(line) && line.length < 40) {
      return line
    }
  }
  return ''
}

function extractName(lines) {
  const skip = /[@http|linkedin|github|tel:|phone:|mail:|\d{5,}|née|né\s|born]/i
  const stop = /^(profil|expérience|formation|compétence|skill|education)/i
  for (const line of lines.slice(0, 12)) {
    if (skip.test(line) || stop.test(line)) continue
    const words = line.split(/\s+/).filter(Boolean)
    if (words.length < 2 || words.length > 5) continue
    if (words.every(w => /^[A-ZÀÁÂÉÈÊËÎÏÔÙÛÜ][a-zA-ZÀ-ÿ'-]+$/.test(w))) {
      return { prenom: words[0], nom: words.slice(1).join(' ') }
    }
  }
  return { prenom: '', nom: '' }
}

function extractHeadline(lines, name) {
  if (!name.prenom) return ''
  const idx = lines.findIndex(l => l.includes(name.prenom))
  if (idx < 0) return ''
  for (const l of lines.slice(idx + 1, idx + 5)) {
    if (l.length > 5 && l.length < 90 && !/@/.test(l) && !/\d{6,}/.test(l)) return l
  }
  return ''
}

function splitSections(text) {
  // First pass: strip dots from lines, then split by section headers
  const lines = text.split('\n')
    .map(l => stripDots(l.trim()))
    .filter(Boolean)

  const sections = {
    header: [], profile: [], experience: [], education: [],
    skills: [], qualites: [], langues: [], passions: [],
  }
  let current = 'header'

  for (const line of lines) {
    const cleaned = cleanLine(line)
    let hit = false
    for (const [key, re] of Object.entries(SECTION_RE)) {
      if (re.test(cleaned)) { current = key; hit = true; break }
    }
    if (!hit) sections[current].push(line)
  }
  return sections
}

function parseEntries(lines, isEdu = false) {
  const entries = []
  let cur = null

  for (const rawLine of lines) {
    // Strip visual dot separators e.g. "2008-2010 ..... content"
    const line = stripDots(rawLine)
    DATE_RANGE_RE.lastIndex = 0
    const dateMatch = line.match(DATE_RANGE_RE)

    if (dateMatch) {
      if (cur) entries.push(cur)
      const { debut, fin } = parseDateRange(dateMatch[0])
      // Content after the date on the same line
      const rest = line.replace(dateMatch[0], '').replace(/^[\s\-–:,]+/, '').trim()
      cur = isEdu
        ? { id: mkId(), diplome: rest, ecole: '', debut, fin, description: '' }
        : { id: mkId(), poste: rest, entreprise: '', debut, fin, description: '' }
    } else if (cur) {
      const titleKey = isEdu ? 'diplome' : 'poste'
      const orgKey   = isEdu ? 'ecole'   : 'entreprise'
      if (!cur[titleKey] && line.length < 100) {
        cur[titleKey] = line
      } else if (!cur[orgKey] && line.length < 80 && !/[.]{2,}/.test(line)) {
        cur[orgKey] = line
      } else {
        const cleaned = line.replace(/^[•\-\*]\s*/, '')
        cur.description += (cur.description ? '\n' : '') + cleaned
      }
    } else {
      // Try "Title — Org" or "Title | Org" pattern (no date)
      const sep = line.match(/^(.+?)\s*[–|—]\s*(.+)$/)
      if (sep && sep[1].length < 80 && sep[2].length < 80) {
        cur = isEdu
          ? { id: mkId(), diplome: sep[1].trim(), ecole: sep[2].trim(), debut: '', fin: '', description: '' }
          : { id: mkId(), poste: sep[1].trim(), entreprise: sep[2].trim(), debut: '', fin: '', description: '' }
      } else if (line.length > 3 && line.length < 100) {
        // Standalone title line with no date yet
        cur = isEdu
          ? { id: mkId(), diplome: line, ecole: '', debut: '', fin: '', description: '' }
          : { id: mkId(), poste: line, entreprise: '', debut: '', fin: '', description: '' }
      }
    }
  }
  if (cur) entries.push(cur)
  return entries.filter(e => isEdu ? (e.diplome || e.ecole) : (e.poste || e.entreprise))
}

function parseSkills(lines) {
  const raw = lines.join(' , ')
  // Strip star ratings (★★★★★) and similar visual patterns
  const cleaned = raw.replace(/[★☆✩✦♦♠♣♥*]{2,}/g, '').replace(/\d+\/\d+/g, '')
  const items = cleaned
    .split(/[,;•·\-\n|\/]/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 60 && !/^(compétences?|skills?|logiciels?|systèmes?)/i.test(s))
  const seen = new Set()
  return items
    .filter(s => { if (seen.has(s.toLowerCase())) return false; seen.add(s.toLowerCase()); return true })
    .slice(0, 20)
    .map(nom => ({ id: mkId(), nom, niveau: '' }))
}

function parseSimpleList(lines) {
  const raw = lines.join('\n')
  const items = raw
    .split(/[,;\n]/)
    .map(s => s.replace(/^[-–*•○]\s*/, '').trim())
    .filter(s => s.length > 1 && s.length < 80)
  const seen = new Set()
  return items
    .filter(s => { if (seen.has(s.toLowerCase())) return false; seen.add(s.toLowerCase()); return true })
    .slice(0, 15)
    .map(nom => ({ id: mkId(), nom }))
}

function parseLangues(lines) {
  // Strip star/score ratings like "★★★★★" or "5/5"
  const raw = lines.join('\n').replace(/[★☆✩✦*]{1,6}/g, '').replace(/\d+\/\d+/g, '')
  const items = raw
    .split(/[,;\n]/)
    .map(s => s.replace(/^[-–*•○]\s*/, '').trim())
    .filter(s => s.length > 1 && s.length < 80)
  const seen = new Set()
  return items
    .filter(s => {
      const key = s.toLowerCase().split(/[\s(]/)[0]
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 6)
    .map(raw => {
      const m = raw.match(/^(.+?)\s*[\(\-:]\s*(.+?)\)?$/)
      if (m) return { id: mkId(), nom: m[1].trim(), niveau: m[2].trim() }
      return { id: mkId(), nom: raw, niveau: '' }
    })
}

export function parseCV(text) {
  // Pre-process: normalise fancy dashes and strip null bytes
  const normalized = text
    .replace(/–|—|―/g, '-')
    .replace(/\0/g, '')

  const sec = splitSections(normalized)
  const allLines = normalized.split('\n').map(l => l.trim())

  const contact     = extractContact(normalized)
  const name        = extractName(sec.header.length > 0 ? sec.header : allLines)
  const headline    = extractHeadline(allLines, name)
  const resume      = sec.profile.join(' ').replace(/\s+/g, ' ').slice(0, 600)
  const github      = extractGithub(normalized)
  const localisation = extractLocation(normalized)

  return {
    personal: {
      prenom: name.prenom, nom: name.nom,
      headline, resume,
      email: contact.email, telephone: contact.telephone,
      localisation, github,
      photoUrl: null, photoFile: null,
    },
    experiences: parseEntries(sec.experience, false),
    formations:  parseEntries(sec.education,  true),
    competences: parseSkills(sec.skills),
    qualites:    parseSimpleList(sec.qualites),
    langues:     parseLangues(sec.langues),
    passions:    parseSimpleList(sec.passions),
  }
}
