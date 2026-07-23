function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function fmtDate(raw) {
  if (!raw) return ''
  const parts = raw.split('-')
  if (parts.length === 2) {
    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
    const m = parseInt(parts[1], 10) - 1
    return (months[m] ? months[m] + ' ' : '') + parts[0]
  }
  return raw
}

function dateRange(debut, fin) {
  const s = fmtDate(debut)
  const e = fin ? fmtDate(fin) : 'En cours'
  return s ? `${s} – ${e}` : e
}

function renderDesc(desc) {
  if (!desc) return ''
  const lines = desc.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length <= 1) return `<p class="entry-desc">${esc(desc)}</p>`
  return (
    '<ul class="entry-list">' +
    lines.map(l => `<li>${esc(l.replace(/^[•\-\*]\s*/, ''))}</li>`).join('') +
    '</ul>'
  )
}

/* ── Inline SVG icons ── */
const SVG_USER = `<svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/></svg>`
const SVG_BRIEF = `<svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-6-2h-4v2h4V5z"/></svg>`
const SVG_GRAD  = `<svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>`
const SVG_PHONE = `<svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.22 2.21z"/></svg>`
const SVG_MAIL  = `<svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
const SVG_LOC   = `<svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
const SVG_LINK  = `<svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`

export function generateCVHtml(cv) {
  const p            = cv.personal   ?? {}
  const experiences  = cv.experiences ?? []
  const formations   = cv.formations  ?? []
  const competences  = cv.competences ?? []
  const qualites     = cv.qualites    ?? []
  const langues      = cv.langues     ?? []
  const passions     = cv.passions    ?? []

  const prenom       = esc(p.prenom       ?? '')
  const nom          = esc(p.nom          ?? '')
  const headline     = esc(p.headline     ?? '')
  const email        = esc(p.email        ?? '')
  const telephone    = esc(p.telephone    ?? '')
  const localisation = esc(p.localisation ?? '')
  const github       = esc(p.github       ?? '')
  const resume       = (p.resume ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')
  const photoUrl     = p.photoUrl ?? ''
  const initials     = ((p.prenom ?? '').charAt(0) + (p.nom ?? '').charAt(0)).toUpperCase()

  /* ── Sidebar: sidebar sections ── */
  const contactRows = [
    telephone    ? `<div class="sb-item">${SVG_PHONE}<span>${telephone}</span></div>` : '',
    email        ? `<div class="sb-item">${SVG_MAIL}<span>${email}</span></div>` : '',
    localisation ? `<div class="sb-item">${SVG_LOC}<span>${localisation}</span></div>` : '',
    github       ? `<div class="sb-item">${SVG_LINK}<span>${github}</span></div>` : '',
  ].filter(Boolean).join('')

  const sbContact = contactRows ? `
    <div class="sb-section">
      <div class="sb-title">Contact</div>
      ${contactRows}
    </div>` : ''

  const sbCompetences = competences.length ? `
    <div class="sb-section">
      <div class="sb-title">Compétences</div>
      ${competences.map(c => `<div class="sb-bullet">• ${esc(c.nom ?? '')}</div>`).join('')}
    </div>` : ''

  const sbQualites = qualites.length ? `
    <div class="sb-section">
      <div class="sb-title">Qualités</div>
      ${qualites.map(q => `<div class="sb-bullet">• ${esc(q.nom ?? '')}</div>`).join('')}
    </div>` : ''

  const sbLangues = langues.length ? `
    <div class="sb-section">
      <div class="sb-title">Langues</div>
      ${langues.map(l => `<div class="sb-bullet">• ${esc(l.nom ?? '')}${l.niveau ? ` (${esc(l.niveau)})` : ''}</div>`).join('')}
    </div>` : ''

  const sbPassions = passions.length ? `
    <div class="sb-section">
      <div class="sb-title">Passions</div>
      ${passions.map(pa => `<div class="sb-bullet">• ${esc(pa.nom ?? '')}</div>`).join('')}
    </div>` : ''

  /* ── Main: PROFIL ── */
  const profileSection = resume ? `
    <div class="section">
      <div class="sec-head">
        <div class="sec-icon">${SVG_USER}</div>
        <div class="sec-title">Profil</div>
      </div>
      <div class="sec-rule"></div>
      <p class="profile-txt">${resume}</p>
    </div>` : ''

  /* ── Main: EXPÉRIENCES (timeline) ── */
  const expItems = experiences.filter(e => e.poste || e.entreprise)
  const expHtml = expItems.length ? `
    <div class="section">
      <div class="sec-head">
        <div class="sec-icon">${SVG_BRIEF}</div>
        <div class="sec-title">Expérience Professionnelle</div>
      </div>
      <div class="sec-rule"></div>
      <div class="timeline">
        ${expItems.map((e, i) => {
          const title = [esc(e.poste ?? ''), esc(e.entreprise ?? '')].filter(Boolean).join(' – ')
          const date  = (e.debut || e.fin) ? dateRange(e.debut, e.fin) : ''
          const dot   = i === 0 ? 'tl-dot filled' : 'tl-dot'
          const last  = i === expItems.length - 1
          return `
          <div class="tl-row">
            <div class="tl-left">
              <div class="${dot}"></div>
              ${!last ? '<div class="tl-line"></div>' : ''}
            </div>
            <div class="tl-content">
              <div class="entry-head">
                <div class="entry-title">${title}</div>
                ${date ? `<div class="entry-date">${date}</div>` : ''}
              </div>
              ${renderDesc(e.description ?? '')}
            </div>
          </div>`
        }).join('')}
      </div>
    </div>` : ''

  /* ── Main: FORMATIONS (timeline) ── */
  const formItems = formations.filter(f => f.diplome || f.ecole)
  const formHtml = formItems.length ? `
    <div class="section">
      <div class="sec-head">
        <div class="sec-icon">${SVG_GRAD}</div>
        <div class="sec-title">Formation</div>
      </div>
      <div class="sec-rule"></div>
      <div class="timeline">
        ${formItems.map((f, i) => {
          const title = [esc(f.diplome ?? ''), esc(f.ecole ?? '')].filter(Boolean).join(' – ')
          const date  = (f.debut || f.fin) ? dateRange(f.debut, f.fin) : ''
          const dot   = i === 0 ? 'tl-dot filled' : 'tl-dot'
          const last  = i === formItems.length - 1
          return `
          <div class="tl-row">
            <div class="tl-left">
              <div class="${dot}"></div>
              ${!last ? '<div class="tl-line"></div>' : ''}
            </div>
            <div class="tl-content">
              <div class="entry-head">
                <div class="entry-title">${title}</div>
                ${date ? `<div class="entry-date">${date}</div>` : ''}
              </div>
              ${renderDesc(f.description ?? '')}
            </div>
          </div>`
        }).join('')}
      </div>
    </div>` : ''

  /* ── HTML ── */
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  color: #1a1a1a;
  width: 794px;
}

/* ═══ TWO-COLUMN WRAPPER ═══ */
.cv-wrap {
  display: table;
  width: 100%;
  min-height: 1123px;
}

/* ═══ LEFT SIDEBAR ═══ */
.sidebar {
  display: table-cell;
  width: 258px;
  background: #1B2744;
  color: #fff;
  vertical-align: top;
  padding: 22px 16px 22px 16px;
}

/* Epitech logo */
.sb-logo {
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 18px;
  line-height: 1;
}
.sb-logo .brace { color: #5B8DD9; font-size: 16px; font-weight: 900; }

/* Circular photo */
.avatar-wrap {
  text-align: center;
  margin-bottom: 20px;
}
.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.28);
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.12);
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}
.avatar img {
  width: 88px;
  height: 88px;
  object-fit: cover;
  display: block;
}

/* Sidebar sections */
.sb-section { margin-bottom: 16px; }
.sb-title {
  font-size: 7.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  color: rgba(255,255,255,0.52);
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255,255,255,0.16);
  margin-bottom: 8px;
}
.sb-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 8px;
  color: rgba(255,255,255,0.82);
  margin-bottom: 5px;
  line-height: 1.45;
  word-break: break-all;
}
.sb-item svg { flex-shrink: 0; margin-top: 1px; }
.sb-bullet {
  font-size: 8.5px;
  color: rgba(255,255,255,0.85);
  margin-bottom: 4px;
  line-height: 1.5;
}

/* ═══ RIGHT MAIN COLUMN ═══ */
.main {
  display: table-cell;
  vertical-align: top;
  background: #fff;
}

/* Dark name/title header band */
.main-header {
  background: #1B2744;
  padding: 26px 24px 20px;
}
.main-name {
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2.5px;
  color: #fff;
  line-height: 1.1;
  margin-bottom: 6px;
}
.main-headline {
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: rgba(255,255,255,0.55);
  font-weight: 400;
}

/* Main white body */
.main-body { padding: 18px 22px; }

/* ═══ SECTIONS ═══ */
.section { margin-bottom: 18px; }

.sec-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}
.sec-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1B2744;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sec-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #1B2744;
}
.sec-rule {
  height: 1px;
  background: #1B2744;
  margin-bottom: 11px;
}

.profile-txt {
  font-size: 9px;
  line-height: 1.75;
  color: #374151;
  text-align: justify;
}

/* ═══ TIMELINE ═══ */
.timeline { }
.tl-row {
  display: flex;
  gap: 10px;
  margin-bottom: 0;
}
.tl-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 12px;
}
.tl-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 2px solid #1B2744;
  background: transparent;
  flex-shrink: 0;
}
.tl-dot.filled { background: #1B2744; }
.tl-line {
  width: 2px;
  background: #DDE2EC;
  flex: 1;
  min-height: 10px;
  margin: 2px 0;
}
.tl-content {
  flex: 1;
  padding-bottom: 12px;
}

.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 3px;
}
.entry-title {
  font-size: 9.5px;
  font-weight: 700;
  color: #1B2744;
  line-height: 1.3;
  flex: 1;
}
.entry-date {
  font-size: 8px;
  color: #4BAFC8;
  white-space: nowrap;
  font-weight: 700;
  flex-shrink: 0;
}
.entry-desc {
  font-size: 8.5px;
  color: #4B5563;
  line-height: 1.65;
  margin-top: 3px;
}
.entry-list {
  margin-top: 4px;
  padding-left: 12px;
  font-size: 8.5px;
  color: #4B5563;
  line-height: 1.65;
}
.entry-list li { margin-bottom: 2px; }
</style>
</head>
<body>

<div class="cv-wrap">

  <!-- ════ SIDEBAR ════ -->
  <div class="sidebar">

    <!-- Logo Epitech -->
    <div class="sb-logo"><span class="brace">{</span>EPITECH<span class="brace">}</span></div>

    <!-- Photo de profil -->
    <div class="avatar-wrap">
      <div class="avatar">
        ${photoUrl
          ? `<img src="${esc(photoUrl)}" alt="${prenom} ${nom}">`
          : initials || '?'}
      </div>
    </div>

    ${sbContact}
    ${sbCompetences}
    ${sbQualites}
    ${sbLangues}
    ${sbPassions}

  </div>

  <!-- ════ MAIN ════ -->
  <div class="main">

    <!-- Header sombre : Nom + Titre -->
    <div class="main-header">
      <div class="main-name">${prenom} ${nom}</div>
      ${headline ? `<div class="main-headline">${headline}</div>` : ''}
    </div>

    <!-- Corps blanc -->
    <div class="main-body">
      ${profileSection}
      ${expHtml}
      ${formHtml}
    </div>

  </div>

</div>

</body>
</html>`
}
