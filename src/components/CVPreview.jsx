function fmtDate(raw) {
  if (!raw) return ''
  const [y, m] = raw.split('-')
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return m ? `${months[parseInt(m) - 1]} ${y}` : y
}

function DateRange({ debut, fin }) {
  if (!debut && !fin) return null
  const start = fmtDate(debut)
  const end   = fin ? fmtDate(fin) : 'En cours'
  return <span className="cv-entry-date">{start}{start ? ' → ' : ''}{end}</span>
}

const MailIcon = () => (
  <svg className="cv-contact-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
)

const PhoneIcon = () => (
  <svg className="cv-contact-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .9h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.1 17.9l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
)

export default function CVPreview({ cv }) {
  const { personal, experiences, formations, competences } = cv
  const fullName = [personal.prenom, personal.nom].filter(Boolean).join(' ')
  const initials  = [personal.prenom?.[0], personal.nom?.[0]].filter(Boolean).join('').toUpperCase()
  const isEmpty   = !fullName && !personal.resume && experiences.length === 0 && formations.length === 0 && competences.length === 0

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
      <div className="cv-layout">

        {/* ── Sidebar ── */}
        <aside className="cv-sidebar">
          {/* Avatar */}
          <div className="cv-avatar">
            {personal.photoUrl
              ? <img src={personal.photoUrl} alt="Photo" />
              : <span>{initials || '?'}</span>
            }
          </div>

          {/* Identity */}
          {(fullName || personal.headline) && (
            <div className="cv-id">
              {fullName    && <div className="cv-name">{fullName}</div>}
              {personal.headline && <div className="cv-headline">{personal.headline}</div>}
            </div>
          )}

          {/* Contact */}
          {(personal.email || personal.telephone) && (
            <div className="cv-sb-section">
              <h4>Contact</h4>
              {personal.email && (
                <div className="cv-contact-item">
                  <MailIcon />
                  <span>{personal.email}</span>
                </div>
              )}
              {personal.telephone && (
                <div className="cv-contact-item">
                  <PhoneIcon />
                  <span>{personal.telephone}</span>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {competences.filter(c => c.nom).length > 0 && (
            <div className="cv-sb-section">
              <h4>Compétences</h4>
              {competences.filter(c => c.nom).map(c => (
                <div key={c.id} className="cv-skill-entry">
                  <div className="cv-skill-name">{c.nom}</div>
                  {c.niveau && <span className="cv-skill-level">{c.niveau}</span>}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="cv-main">
          {/* Profile */}
          {personal.resume && (
            <section className="cv-main-section">
              <div className="cv-section-heading">Profil</div>
              <div className="cv-rule" />
              <p className="cv-profile-text">{personal.resume}</p>
            </section>
          )}

          {/* Experiences */}
          {experiences.filter(e => e.poste || e.entreprise).length > 0 && (
            <section className="cv-main-section">
              <div className="cv-section-heading">Expériences</div>
              <div className="cv-rule" />
              {experiences.filter(e => e.poste || e.entreprise).map(e => (
                <div key={e.id} className="cv-entry">
                  <div className="cv-entry-head">
                    <span className="cv-entry-title">{e.poste || <em>Poste</em>}</span>
                    <DateRange debut={e.debut} fin={e.fin} />
                  </div>
                  {e.entreprise && <div className="cv-entry-org">{e.entreprise}</div>}
                  {e.description && <p className="cv-entry-desc">{e.description}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {formations.filter(f => f.diplome || f.ecole).length > 0 && (
            <section className="cv-main-section">
              <div className="cv-section-heading">Formations</div>
              <div className="cv-rule" />
              {formations.filter(f => f.diplome || f.ecole).map(f => (
                <div key={f.id} className="cv-entry">
                  <div className="cv-entry-head">
                    <span className="cv-entry-title">{f.diplome || <em>Diplôme</em>}</span>
                    <DateRange debut={f.debut} fin={f.fin} />
                  </div>
                  {f.ecole && <div className="cv-entry-org">{f.ecole}</div>}
                  {f.description && <p className="cv-entry-desc">{f.description}</p>}
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
