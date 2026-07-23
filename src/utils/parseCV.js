const mkId = () => Math.random().toString(36).slice(2)

function cleanLine(line) {
  return line
    .replace(/[^\w\sàâäéèêëîïôùûüçÀÂÄÉÈÊËÎÏÔÙÛÜÇ''-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripDots(str) {
  return str.replace(/\.{3,}/g, ' ').replace(/\s+/g, ' ').trim()
}

/* ── Section headers ── */
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
const MONTH_FR  = 'jan\\w*|fév\\w*|mar\\w*|avr\\w*|mai|juin|juil\\w*|ao[uû]\\w*|sep\\w*|oct\\w*|nov\\w*|déc\\w*'
const MONTH_EN  = 'jan\\w*|feb\\w*|mar\\w*|apr\\w*|may|jun\\w*|jul\\w*|aug\\w*|sep\\w*|oct\\w*|nov\\w*|dec\\w*'
const MONTH_ALL = `${MONTH_FR}|${MONTH_EN}`
const YEAR      = '\\d{4}'
const SEP       = '[-–→/àa]|\\s+à\\s+|\\s+au\\s+|\\s+et\\s+'

const DATE_RANGE_RE = new RegExp(
  `(?:depuis\\s+)?(?:(?:${MONTH_ALL})\\s+)?${YEAR}\\s*(?:${SEP})\\s*(?:(?:${MONTH_ALL})\\s+)?${YEAR}` +
  `|(?:depuis\\s+(?:(?:${MONTH_ALL})\\s+)?${YEAR})` +
  `|(?:présent|actuel|aujourd'hui|en cours|current|now)`,
  'gi'
)

const MONTH_MAP = {
  jan:'01', fév:'02', feb:'02', fev:'02', mar:'03', avr:'04', apr:'04',
  mai:'05', may:'05', juin:'06', jun:'06', juil:'07', jul:'07',
  aou:'08', aoû:'08', aug:'08', sep:'09', oct:'10', nov:'11', déc:'12', dec:'12',
}

function toMonthInput(raw) {
  if (!raw) return ''
  raw = raw.trim().toLowerCase().replace(/^depuis\s+/, '')
  if (/présent|actuel|cours|current|now/.test(raw)) return ''
  const mMatch = raw.match(/([a-zéûô]+)\s+(\d{4})/)
  if (mMatch) {
    const key = mMatch[1].slice(0, 3).normalize('NFD').replace(/[̀-ͯ]/g, '')
    const m   = MONTH_MAP[key] || MONTH_MAP[mMatch[1].slice(0, 3)] || '01'
    return `${mMatch[2]}-${m}`
  }
  const yMatch = raw.match(/\d{4}/)
  return yMatch ? `${yMatch[0]}-01` : ''
}

function parseDateRange(str) {
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

/* ── Improved extractLocation: look at first 50 lines ── */
function extractLocation(text) {
  const lines = text.split('\n').map(l => l.trim())
  for (const line of lines.slice(0, 50)) {
    if (/(?:mobilité|mobile|localisation|adresse|ville|city)\s*[:–-]/i.test(line)) {
      return line.replace(/.*?[:–-]\s*/, '').trim().slice(0, 60)
    }
    if (
      /^[A-ZÀÁÂÉÈÊÎÏÔÙÛ][a-zàáâéèêîïôùûü]+(?:\s*[/(]\s*(?:MOBILITÉ|Mobilité|FRANCE|France|\d{2}))?$/.test(line) &&
      line.length >= 2 && line.length < 40 &&
      !/^(profil|formation|expérience|compétence|langue|qualité|passion|contact|présentation)/i.test(line)
    ) {
      return line
    }
  }
  return ''
}

/* ── Improved extractName: 40 lines, handles ALL CAPS names ── */
function extractName(lines) {
  const sectionWords = /^(profil|expérience|formation|compétence|skill|education|contact|passion|langue|qualité|hobby|présentation|about|summary)/i
  for (const line of lines.slice(0, 40)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (/@|http|linkedin|github/i.test(trimmed)) continue
    if (sectionWords.test(trimmed)) continue
    if (/\d{4}/.test(trimmed)) continue  // skip date-containing lines

    const words = trimmed.split(/\s+/).filter(Boolean)
    if (words.length < 2 || words.length > 5) continue

    // Title case: "Jean Dupont"
    if (words.every(w => /^[A-ZÀÁÂÉÈÊËÎÏÔÙÛÜ][a-zA-ZÀ-ÿ'-]+$/.test(w))) {
      return { prenom: words[0], nom: words.slice(1).join(' ') }
    }
    // ALL CAPS: "DJOUNDI BAKARI"
    if (words.every(w => /^[A-ZÀÁÂÉÈÊËÎÏÔÙÛÜÇ]{2,}$/.test(w))) {
      const toTitle = w => w.charAt(0) + w.slice(1).toLowerCase()
      return { prenom: toTitle(words[0]), nom: words.slice(1).map(toTitle).join(' ') }
    }
  }
  return { prenom: '', nom: '' }
}

/* ── Improved extractHeadline: handles ALL CAPS headline ── */
function extractHeadline(lines, name) {
  if (!name.prenom) return ''
  const nameUpper  = name.prenom.toUpperCase()
  const nameNormal = name.prenom
  const idx = lines.findIndex(l => l.includes(nameUpper) || l.includes(nameNormal))
  if (idx < 0) return ''
  for (const l of lines.slice(idx + 1, idx + 6)) {
    if (l.length > 5 && l.length < 100 && !/@/.test(l) && !/\d{6,}/.test(l) && !/^(profil|expérience|formation)/i.test(l)) {
      return l
    }
  }
  return ''
}

function splitSections(text) {
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

/* ── Known language names for filtering ── */
const LANG_RE = /^(français|anglais|espagnol|allemand|italien|portugais|arabe|chinois|japonais|russe|néerlandais|french|english|spanish|german|italian|arabic|chinese|japanese)/i

/* ── Known skill-like patterns (short, no spaces or few words) ── */
function looksLikeSkill(s) {
  return s.length > 1 && s.length < 50 && !LANG_RE.test(s) && !/^[A-Z][a-z]+ \(/.test(s)
}

/*
 * Two-column PDF fix: after standard section splitting, redistributes misplaced content.
 * In 2-col PDFs (sidebar on left), pdfjs often reads sidebar headers+content before
 * main column content, causing skills to land in 'langues', languages in 'qualites', etc.
 */
function fixScrambledSections(sec) {
  // If skills is empty but langues has skill-like items → move skills out of langues
  if (sec.skills.length === 0 && sec.langues.length > 0) {
    const skillLines = sec.langues.filter(l => looksLikeSkill(l) && !LANG_RE.test(l))
    const langLines  = sec.langues.filter(l => LANG_RE.test(l))
    if (skillLines.length > 0) {
      sec.skills = skillLines
      sec.langues = langLines.length > 0 ? langLines : sec.qualites.filter(l => LANG_RE.test(l))
    }
  }

  // If langues is empty but qualites has language-like items → extract them
  if (sec.langues.length === 0 && sec.qualites.length > 0) {
    const langLines  = sec.qualites.filter(l => LANG_RE.test(l))
    const qualLines  = sec.qualites.filter(l => !LANG_RE.test(l))
    if (langLines.length > 0) {
      sec.langues  = langLines
      sec.qualites = qualLines
    }
  }

  // If qualites still has language-like items, remove them
  sec.qualites = sec.qualites.filter(l => !LANG_RE.test(l))

  // If experience is empty but profile has date-containing lines → profile absorbed exp+edu
  const hasDateLine = (lines) => lines.some(l => { DATE_RANGE_RE.lastIndex = 0; return DATE_RANGE_RE.test(l) })
  if (sec.experience.length === 0 && sec.education.length === 0 && hasDateLine(sec.profile)) {
    // Classify profile lines into experience vs education by keywords
    const eduKeywords = /baccalauréat|bachelor|master|licence|formation|école|lycée|bts|université|iut|e-book|auto-formation|en ligne|online|certif|diplôme|spécialité/i
    let expLines  = []
    let eduLines  = []
    let curIsEdu  = false
    let curBuffer = []

    const flush = () => {
      if (curBuffer.length === 0) return
      const text = curBuffer.join(' ')
      if (curIsEdu || eduKeywords.test(text)) { eduLines.push(...curBuffer) }
      else                                     { expLines.push(...curBuffer) }
      curBuffer = []
    }

    for (const line of sec.profile) {
      DATE_RANGE_RE.lastIndex = 0
      if (DATE_RANGE_RE.test(line)) {
        flush()
        curIsEdu = eduKeywords.test(line)
      }
      curBuffer.push(line)
    }
    flush()

    if (expLines.length > 0) sec.experience = expLines
    if (eduLines.length > 0) sec.education  = eduLines
  }

  return sec
}

function parseEntries(lines, isEdu = false) {
  const entries = []
  let cur = null

  for (const rawLine of lines) {
    const line = stripDots(rawLine)
    DATE_RANGE_RE.lastIndex = 0
    const dateMatch = line.match(DATE_RANGE_RE)

    if (dateMatch) {
      if (cur) entries.push(cur)
      const { debut, fin } = parseDateRange(dateMatch[0])
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
      const sep = line.match(/^(.+?)\s*[–|—]\s*(.+)$/)
      if (sep && sep[1].length < 80 && sep[2].length < 80) {
        cur = isEdu
          ? { id: mkId(), diplome: sep[1].trim(), ecole: sep[2].trim(), debut: '', fin: '', description: '' }
          : { id: mkId(), poste: sep[1].trim(), entreprise: sep[2].trim(), debut: '', fin: '', description: '' }
      } else if (line.length > 3 && line.length < 100) {
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
  const raw     = lines.join(' , ')
  const cleaned = raw.replace(/[★☆✩✦♦♠♣♥*]{2,}/g, '').replace(/\d+\/\d+/g, '')
  const items   = cleaned
    .split(/[,;•·\-\n|\/]/)
    .map(s => s.trim())
    .filter(s => s.length > 1 && s.length < 60 && !/^(compétences?|skills?|logiciels?|systèmes?)/i.test(s) && !LANG_RE.test(s))
  const seen = new Set()
  return items
    .filter(s => { if (seen.has(s.toLowerCase())) return false; seen.add(s.toLowerCase()); return true })
    .slice(0, 20)
    .map(nom => ({ id: mkId(), nom, niveau: '' }))
}

function parseSimpleList(lines) {
  const raw   = lines.join('\n')
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
  const raw   = lines.join('\n').replace(/[★☆✩✦*]{1,6}/g, '').replace(/\d+\/\d+/g, '')
  const items = raw
    .split(/[,;\n]/)
    .map(s => s.replace(/^[-–*•○]\s*/, '').trim())
    .filter(s => s.length > 1 && s.length < 80 && LANG_RE.test(s))
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
  const normalized = text.replace(/–|—|―/g, '-').replace(/\0/g, '')

  const rawSec = splitSections(normalized)
  const sec    = fixScrambledSections(rawSec)
  const allLines = normalized.split('\n').map(l => l.trim())

  const contact     = extractContact(normalized)
  const name        = extractName(allLines)
  const headline    = extractHeadline(allLines, name)
  const github      = extractGithub(normalized)
  const localisation = extractLocation(normalized)

  // Profile: take from profile section; if empty, look in header
  const profileText = sec.profile.length > 0 ? sec.profile : sec.header
  const resume = profileText
    .filter(l => l.length > 30 && !/\d{4}/.test(l))  // skip short lines and date lines
    .join(' ')
    .replace(/\s+/g, ' ')
    .slice(0, 600)

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
