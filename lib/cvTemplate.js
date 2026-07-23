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

function fmtRange(debut, fin) {
  const s = fmtDate(debut)
  const e = fin ? fmtDate(fin) : 'En cours'
  return s ? `${s} → ${e}` : e
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

const SVG_PHONE = `<svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.22 2.21z"/></svg>`
const SVG_MAIL  = `<svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
const SVG_LOC   = `<svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
const SVG_LINK  = `<svg width="9" height="9" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`

export function generateCVHtml(cv) {
  const p            = cv.personal   ?? {}
  const experiences  = cv.experiences ?? []
  const projets      = cv.projets     ?? []
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

  /* ── Sidebar contact ── */
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
      <div class="chips">
        ${competences.map(c => `<span class="chip">${esc(c.nom ?? '')}</span>`).join('')}
      </div>
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
      <div class="sec-title">Profil</div>
      <div class="sec-rule"></div>
      <p class="profile-txt">${resume}</p>
    </div>` : ''

  /* ── Main: EXPÉRIENCES ── */
  const expItems = experiences.filter(e => e.poste || e.entreprise)
  const expHtml = expItems.length ? `
    <div class="section">
      <div class="sec-title">Expériences</div>
      <div class="sec-rule"></div>
      <div class="entries">
        ${expItems.map(e => {
          const title = esc(e.poste ?? e.entreprise ?? '')
          const metaParts = [
            e.entreprise ? esc(e.entreprise) : null,
            (e.debut || e.fin) ? fmtRange(e.debut, e.fin) : null
          ].filter(Boolean)
          const meta = metaParts.join(' • ')
          return `
          <div class="entry">
            <div class="entry-title">${title}</div>
            ${meta ? `<div class="entry-meta">${meta}</div>` : ''}
            ${renderDesc(e.description ?? '')}
          </div>`
        }).join('')}
      </div>
    </div>` : ''

  /* ── Main: PROJETS ── */
  const projItems = projets.filter(pr => pr.nom)
  const projHtml = projItems.length ? `
    <div class="section">
      <div class="sec-title">Projets</div>
      <div class="sec-rule"></div>
      <div class="entries">
        ${projItems.map(pr => {
          const title = esc(pr.nom ?? '')
          const metaParts = [
            pr.technologies ? esc(pr.technologies) : null,
            pr.lien ? esc(pr.lien) : null
          ].filter(Boolean)
          const meta = metaParts.join(' • ')
          return `
          <div class="entry">
            <div class="entry-title">${title}</div>
            ${meta ? `<div class="entry-meta">${meta}</div>` : ''}
            ${renderDesc(pr.description ?? '')}
          </div>`
        }).join('')}
      </div>
    </div>` : ''

  /* ── Main: FORMATIONS ── */
  const formItems = formations.filter(f => f.diplome || f.ecole)
  const formHtml = formItems.length ? `
    <div class="section">
      <div class="sec-title">Formation</div>
      <div class="sec-rule"></div>
      <div class="entries">
        ${formItems.map(f => {
          const title = esc(f.diplome ?? f.ecole ?? '')
          const metaParts = [
            f.diplome && f.ecole ? esc(f.ecole) : null,
            (f.debut || f.fin) ? fmtRange(f.debut, f.fin) : null
          ].filter(Boolean)
          const meta = metaParts.join(' • ')
          return `
          <div class="entry">
            <div class="entry-title">${title}</div>
            ${meta ? `<div class="entry-meta">${meta}</div>` : ''}
            ${renderDesc(f.description ?? '')}
          </div>`
        }).join('')}
      </div>
    </div>` : ''

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

.cv-wrap {
  display: table;
  width: 100%;
  min-height: 1123px;
}

/* ═══ SIDEBAR bleue ═══ */
.sidebar {
  display: table-cell;
  width: 246px;
  background: #2060D8;
  color: #fff;
  vertical-align: top;
  padding: 22px 14px 22px;
}

.sb-logo {
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 16px;
  line-height: 1;
}
.sb-logo .brace { color: rgba(255,255,255,0.55); font-size: 15px; font-weight: 900; }

.avatar-wrap { text-align: center; margin-bottom: 14px; }
.avatar {
  width: 84px; height: 84px; border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.3);
  overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.15);
  font-size: 22px; font-weight: 700; color: #fff;
}
.avatar img { width: 84px; height: 84px; object-fit: cover; display: block; }

.sb-identity {
  text-align: center;
  margin-bottom: 14px;
}
.sb-name {
  font-size: 13px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.5px;
  color: #fff; line-height: 1.2; margin-bottom: 5px;
}
.sb-headline {
  font-size: 8.5px; color: rgba(255,255,255,0.75);
  font-weight: 400; line-height: 1.45;
}

.sb-section { margin-bottom: 14px; }
.sb-title {
  font-size: 7.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.6px;
  color: rgba(255,255,255,0.55);
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  margin-bottom: 8px;
}
.sb-item {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 8px; color: rgba(255,255,255,0.85);
  margin-bottom: 5px; line-height: 1.45; word-break: break-all;
}
.sb-item svg { flex-shrink: 0; margin-top: 1px; }
.sb-bullet {
  font-size: 8.5px; color: rgba(255,255,255,0.85);
  margin-bottom: 4px; line-height: 1.5;
}

/* Chips compétences */
.chips { }
.chip {
  display: inline-block;
  font-size: 7.5px; font-weight: 600;
  color: #fff; background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: 20px; padding: 2px 8px;
  margin: 0 3px 4px 0; line-height: 1.6;
}

/* ═══ MAIN column ═══ */
.main {
  display: table-cell;
  vertical-align: top;
  background: #fff;
}

.main-body { padding: 20px 22px; }

/* ═══ SECTIONS ═══ */
.section { margin-bottom: 18px; }

.sec-title {
  font-size: 10.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 1.8px;
  color: #2060D8; margin-bottom: 5px;
}
.sec-rule {
  height: 1.5px; background: #2060D8;
  border-radius: 1px; margin-bottom: 12px;
}

.profile-txt {
  font-size: 9px; line-height: 1.75; color: #374151; text-align: justify;
}

/* ═══ ENTRIES ═══ */
.entries { }
.entry { margin-bottom: 12px; }
.entry:last-child { margin-bottom: 0; }

.entry-title {
  font-size: 10px; font-weight: 700; color: #111827; line-height: 1.3;
  margin-bottom: 2px;
}
.entry-meta {
  font-size: 8.5px; color: #2060D8; font-weight: 600;
  margin-bottom: 4px; line-height: 1.4;
}
.entry-desc {
  font-size: 8.5px; color: #4B5563; line-height: 1.65; margin-top: 2px;
}
.entry-list {
  margin-top: 3px; padding-left: 12px;
  font-size: 8.5px; color: #4B5563; line-height: 1.65;
}
.entry-list li { margin-bottom: 2px; }
</style>
</head>
<body>

<div class="cv-wrap">

  <!-- ════ SIDEBAR ════ -->
  <div class="sidebar">

    <div class="sb-logo"><span class="brace">{</span>EPITECH<span class="brace">}</span></div>

    <div class="avatar-wrap">
      <div class="avatar">
        ${photoUrl
          ? `<img src="${esc(photoUrl)}" alt="${prenom} ${nom}">`
          : initials || '?'}
      </div>
    </div>

    <div class="sb-identity">
      <div class="sb-name">${prenom} ${nom}</div>
      ${headline ? `<div class="sb-headline">${headline}</div>` : ''}
    </div>

    ${sbContact}
    ${sbCompetences}
    ${sbQualites}
    ${sbLangues}
    ${sbPassions}

  </div>

  <!-- ════ MAIN ════ -->
  <div class="main">
    <div class="main-body">
      ${profileSection}
      ${expHtml}
      ${projHtml}
      ${formHtml}
    </div>
  </div>

</div>

</body>
</html>`
}
