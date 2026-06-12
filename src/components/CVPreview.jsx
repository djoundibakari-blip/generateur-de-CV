function fmtDate(raw) {
  if (!raw) return ''
  const [y, m] = raw.split('-')
  const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
  return m ? `${months[parseInt(m) - 1]} ${y}` : y
}

function DateRange({ debut, fin }) {
  if (!debut && !fin) return null
  const s = fmtDate(debut)
  const e = fin ? fmtDate(fin) : 'En cours'
  return <span className="cv-date">{s}{s ? ' – ' : ''}{e}</span>
}

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

function SideSection({ title, children }) {
  return (
    <div className="cv-sb-section">
      <div className="cv-sb-title">{title}</div>
      {children}
    </div>
  )
}

function MainSection({ icon, title, children }) {
  return (
    <section className="cv-main-section">
      <div className="cv-main-heading">
        <span className="cv-heading-icon">{icon}</span>
        {title}
      </div>
      <div className="cv-main-rule" />
      {children}
    </section>
  )
}

export default function CVPreview({ cv }) {
  const { personal, experiences, formations, competences, qualites = [], langues = [], passions = [] } = cv
  const fullName = [personal.prenom, personal.nom].filter(Boolean).join(' ')
  const initials  = [personal.prenom?.[0], personal.nom?.[0]].filter(Boolean).join('').toUpperCase()

  const exps   = experiences.filter(e => e.poste || e.entreprise)
  const forms  = formations.filter(f => f.diplome || f.ecole)
  const comps  = competences.filter(c => c.nom)
  const quals  = qualites.filter(q => q.nom)
  const langs  = langues.filter(l => l.nom)
  const passs  = passions.filter(p => p.nom)

  const isEmpty = !fullName && !personal.resume && exps.length === 0 && forms.length === 0 && comps.length === 0

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

  const renderDesc = (desc) => {
    if (!desc) return null
    const lines = desc.split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
    if (lines.length <= 1) return <p className="cv-entry-desc">{desc}</p>
    return (
      <ul className="cv-entry-list">
        {lines.map((l, i) => <li key={i}>{l}</li>)}
      </ul>
    )
  }

  return (
    <div className="cv-paper">
      {/* ── Header ── */}
      <div className="cv-header">
        <div className="cv-header-name">{fullName || 'Votre Nom'}</div>
        {personal.headline && <div className="cv-header-title">{personal.headline}</div>}
      </div>

      {/* ── Body ── */}
      <div className="cv-body">

        {/* ── Sidebar ── */}
        <aside className="cv-sidebar">
          <div className="cv-avatar">
            {personal.photoUrl
              ? <img src={personal.photoUrl} alt="" />
              : <span>{initials || '?'}</span>}
          </div>

          {(personal.telephone || personal.email || personal.localisation || personal.github) && (
            <SideSection title="Contact">
              {personal.telephone    && <div className="cv-sb-item"><PhoneIcon />{personal.telephone}</div>}
              {personal.email        && <div className="cv-sb-item"><MailIcon  />{personal.email}</div>}
              {personal.localisation && <div className="cv-sb-item"><PinIcon   />{personal.localisation}</div>}
              {personal.github       && <div className="cv-sb-item"><LinkIcon  />{personal.github}</div>}
            </SideSection>
          )}

          {comps.length > 0 && (
            <SideSection title="Compétences">
              {comps.map(c => (
                <div key={c.id} className="cv-sb-bullet">• {c.nom}</div>
              ))}
            </SideSection>
          )}

          {quals.length > 0 && (
            <SideSection title="Qualités">
              {quals.map(q => <div key={q.id} className="cv-sb-bullet">• {q.nom}</div>)}
            </SideSection>
          )}

          {langs.length > 0 && (
            <SideSection title="Langues">
              {langs.map(l => (
                <div key={l.id} className="cv-sb-bullet">
                  • {l.nom}{l.niveau ? ` (${l.niveau})` : ''}
                </div>
              ))}
            </SideSection>
          )}

          {passs.length > 0 && (
            <SideSection title="Passions">
              {passs.map(p => <div key={p.id} className="cv-sb-bullet">• {p.nom}</div>)}
            </SideSection>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="cv-main">
          {personal.resume && (
            <MainSection icon="👤" title="Profil">
              <p className="cv-profile-text">{personal.resume}</p>
            </MainSection>
          )}

          {exps.length > 0 && (
            <MainSection icon="💼" title="Expérience Professionnelle">
              {exps.map(e => (
                <div key={e.id} className="cv-entry">
                  <div className="cv-entry-head">
                    <strong className="cv-entry-title">
                      {e.poste}{e.entreprise ? ` — ${e.entreprise}` : ''}
                    </strong>
                    <DateRange debut={e.debut} fin={e.fin} />
                  </div>
                  {renderDesc(e.description)}
                </div>
              ))}
            </MainSection>
          )}

          {forms.length > 0 && (
            <MainSection icon="🎓" title="Formation">
              {forms.map(f => (
                <div key={f.id} className="cv-entry">
                  <div className="cv-entry-head">
                    <strong className="cv-entry-title">
                      {f.diplome}{f.ecole ? ` — ${f.ecole}` : ''}
                    </strong>
                    <DateRange debut={f.debut} fin={f.fin} />
                  </div>
                  {renderDesc(f.description)}
                </div>
              ))}
            </MainSection>
          )}
        </main>
      </div>
    </div>
  )
}
