/* ── Icons ────────────────────────────────────────────── */
const PhoneIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.1 17.9l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
)
const MailIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
)
const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const LinkIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
)

/* ── Helpers ──────────────────────────────────────────── */
function fmtDate(raw) {
  if (!raw) return ''
  const lower = raw.toLowerCase().trim()
  if (['présent', 'present', 'en cours', 'actuel', "aujourd'hui"].includes(lower)) return 'En cours'
  const [y, m] = raw.split('-')
  const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
  return m ? `${months[parseInt(m) - 1]} ${y}` : y
}

function fmtRange(debut, fin) {
  const s = fmtDate(debut)
  const e = fin ? fmtDate(fin) : 'En cours'
  if (!s) return e
  return `${s} → ${e}`
}

function SideSection({ title, children }) {
  return (
    <div className="cv-sb-section">
      <div className="cv-sb-title">{title}</div>
      {children}
    </div>
  )
}

function MainSection({ title, children }) {
  return (
    <section className="cv-main-section">
      <div className="cv-main-heading">{title}</div>
      <div className="cv-main-rule" />
      {children}
    </section>
  )
}

function Desc({ text }) {
  if (!text) return null
  const lines = text.split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
  if (lines.length <= 1) return <p className="cv-entry-desc">{text}</p>
  return (
    <ul className="cv-entry-list">
      {lines.map((l, i) => <li key={i}>{l}</li>)}
    </ul>
  )
}

/* ══════════════════════════════════════════════════════
   CVPreview
══════════════════════════════════════════════════════ */
export default function CVPreview({ cv }) {
  const { personal, experiences, projets = [], formations, competences, qualites = [], langues = [], passions = [] } = cv
  const fullName = [personal.prenom, personal.nom].filter(Boolean).join(' ').toUpperCase()
  const initials  = [personal.prenom?.[0], personal.nom?.[0]].filter(Boolean).join('').toUpperCase()

  const exps  = experiences.filter(e => e.poste || e.entreprise)
  const projs = projets.filter(p => p.nom)
  const forms = formations.filter(f => f.diplome || f.ecole)
  const comps = competences.filter(c => c.nom)
  const quals = qualites.filter(q => q.nom)
  const langs = langues.filter(l => l.nom)
  const passs = passions.filter(p => p.nom)

  const isEmpty = !fullName && !personal.resume && !exps.length && !projs.length && !forms.length && !comps.length

  if (isEmpty) {
    return (
      <div className="cv-paper">
        <div className="cv-placeholder">
          <span className="cv-placeholder-icon">📄</span>
          <p className="cv-placeholder-text">Remplissez le formulaire pour voir votre CV apparaître ici</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cv-paper">
      <div className="cv-body">

        {/* ══ SIDEBAR ══ */}
        <aside className="cv-sidebar">

          {/* Logo */}
          <div className="cv-logo">
            <span className="cv-logo-brace">{'{'}</span>EPITECH<span className="cv-logo-brace">{'}'}</span>
          </div>

          {/* Photo */}
          <div className="cv-avatar">
            {personal.photoUrl
              ? <img src={personal.photoUrl} alt="" />
              : <span>{initials || '?'}</span>}
          </div>

          {/* Nom + Titre dans la sidebar */}
          <div className="cv-sb-identity">
            <div className="cv-name">{fullName || 'VOTRE NOM'}</div>
            {personal.headline && (
              <div className="cv-title">{personal.headline}</div>
            )}
          </div>

          {/* Contact */}
          {(personal.telephone || personal.email || personal.localisation || personal.github) && (
            <SideSection title="Contact">
              {personal.telephone    && <div className="cv-sb-item"><PhoneIcon /><span>{personal.telephone}</span></div>}
              {personal.email        && <div className="cv-sb-item"><MailIcon  /><span>{personal.email}</span></div>}
              {personal.localisation && <div className="cv-sb-item"><PinIcon   /><span>{personal.localisation}</span></div>}
              {personal.github       && <div className="cv-sb-item"><LinkIcon  /><span>{personal.github}</span></div>}
            </SideSection>
          )}

          {/* Compétences — affichées en chips */}
          {comps.length > 0 && (
            <SideSection title="Compétences">
              <div className="cv-chips">
                {comps.map(c => (
                  <span key={c.id} className="cv-chip">{c.nom}</span>
                ))}
              </div>
            </SideSection>
          )}

          {/* Qualités */}
          {quals.length > 0 && (
            <SideSection title="Qualités">
              {quals.map(q => <div key={q.id} className="cv-sb-bullet">• {q.nom}</div>)}
            </SideSection>
          )}

          {/* Langues */}
          {langs.length > 0 && (
            <SideSection title="Langues">
              {langs.map(l => (
                <div key={l.id} className="cv-sb-bullet">
                  • {l.nom}{l.niveau ? ` (${l.niveau})` : ''}
                </div>
              ))}
            </SideSection>
          )}

          {/* Passions */}
          {passs.length > 0 && (
            <SideSection title="Passions">
              {passs.map(p => <div key={p.id} className="cv-sb-bullet">• {p.nom}</div>)}
            </SideSection>
          )}

        </aside>

        {/* ══ MAIN ══ */}
        <main className="cv-main">
          <div className="cv-sections">

            {/* Profil */}
            {personal.resume && (
              <MainSection title="Profil">
                <p className="cv-profile-text">{personal.resume}</p>
              </MainSection>
            )}

            {/* Expériences */}
            {exps.length > 0 && (
              <MainSection title="Expériences">
                <div className="cv-entries">
                  {exps.map(e => {
                    const meta = [
                      e.entreprise,
                      (e.debut || e.fin) ? fmtRange(e.debut, e.fin) : null
                    ].filter(Boolean).join(' • ')
                    return (
                      <div key={e.id} className="cv-entry">
                        <div className="cv-entry-title">{e.poste || e.entreprise}</div>
                        {meta && <div className="cv-entry-meta">{meta}</div>}
                        <Desc text={e.description} />
                      </div>
                    )
                  })}
                </div>
              </MainSection>
            )}

            {/* Projets */}
            {projs.length > 0 && (
              <MainSection title="Projets">
                <div className="cv-entries">
                  {projs.map(p => {
                    const meta = [p.technologies, p.lien].filter(Boolean).join(' • ')
                    return (
                      <div key={p.id} className="cv-entry">
                        <div className="cv-entry-title">{p.nom}</div>
                        {meta && <div className="cv-entry-meta">{meta}</div>}
                        <Desc text={p.description} />
                      </div>
                    )
                  })}
                </div>
              </MainSection>
            )}

            {/* Formation */}
            {forms.length > 0 && (
              <MainSection title="Formation">
                <div className="cv-entries">
                  {forms.map(f => {
                    const title = f.diplome || f.ecole
                    const meta = [
                      f.diplome && f.ecole ? f.ecole : null,
                      (f.debut || f.fin) ? fmtRange(f.debut, f.fin) : null
                    ].filter(Boolean).join(' • ')
                    return (
                      <div key={f.id} className="cv-entry">
                        <div className="cv-entry-title">{title}</div>
                        {meta && <div className="cv-entry-meta">{meta}</div>}
                        <Desc text={f.description} />
                      </div>
                    )
                  })}
                </div>
              </MainSection>
            )}

          </div>
        </main>

      </div>
    </div>
  )
}
