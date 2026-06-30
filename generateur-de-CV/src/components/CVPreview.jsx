/* ── Icons ────────────────────────────────────────────── */
const PhoneIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.1 17.9l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
)
const MailIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
)
const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const LinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
)
const UserIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8-2h4v2h-4V5zm8 14H4V9h16v10z"/>
  </svg>
)
const GradIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 12.08L5.08 11 12 7.19 18.92 11 12 15.08zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
  </svg>
)

/* ── Helpers ──────────────────────────────────────────── */
function fmtDate(raw) {
  if (!raw) return ''
  const lower = raw.toLowerCase().trim()
  if (['présent', 'present', 'en cours', 'actuel', 'aujourd\'hui'].includes(lower)) return 'En cours'
  const [y, m] = raw.split('-')
  const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
  return m ? `${months[parseInt(m) - 1]} ${y}` : y
}

function DateRange({ debut, fin }) {
  const s = fmtDate(debut)
  const e = fin ? fmtDate(fin) : ''
  if (!s && !e) return null
  const label = s && e ? `${s} – ${e}` : s || e
  return <span className="cv-date">{label}</span>
}

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
        <span>{title}</span>
      </div>
      <div className="cv-main-rule" />
      {children}
    </section>
  )
}

/* ── Render description with bullet points ────────────── */
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
  const { personal, experiences, formations, competences, qualites = [], langues = [], passions = [] } = cv
  const fullName = [personal.prenom, personal.nom].filter(Boolean).join(' ').toUpperCase()
  const initials  = [personal.prenom?.[0], personal.nom?.[0]].filter(Boolean).join('').toUpperCase()

  const exps  = experiences.filter(e => e.poste || e.entreprise)
  const forms = formations.filter(f => f.diplome || f.ecole)
  const comps = competences.filter(c => c.nom)
  const quals = qualites.filter(q => q.nom)
  const langs = langues.filter(l => l.nom)
  const passs = passions.filter(p => p.nom)

  const isEmpty = !fullName && !personal.resume && !exps.length && !forms.length && !comps.length

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

        {/* ══ SIDEBAR GAUCHE ══ */}
        <aside className="cv-sidebar">

          {/* Photo */}
          <div className="cv-avatar">
            {personal.photoUrl
              ? <img src={personal.photoUrl} alt="" />
              : <span>{initials || '?'}</span>}
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

          {/* Compétences */}
          {comps.length > 0 && (
            <SideSection title="Compétences">
              {comps.map(c => (
                <div key={c.id} className="cv-sb-bullet">• {c.nom}</div>
              ))}
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

        {/* ══ COLONNE DROITE ══ */}
        <main className="cv-main">

          {/* Nom + Titre */}
          <div className="cv-name-block">
            <div className="cv-name">{fullName || 'VOTRE NOM'}</div>
            {personal.headline && (
              <div className="cv-title">{personal.headline.toUpperCase()}</div>
            )}
          </div>

          {/* Profil */}
          {personal.resume && (
            <MainSection icon={<UserIcon />} title="Profil">
              <p className="cv-profile-text">{personal.resume}</p>
            </MainSection>
          )}

          {/* Expérience Professionnelle */}
          {exps.length > 0 && (
            <MainSection icon={<BriefcaseIcon />} title="Expérience Professionnelle">
              <div className="cv-timeline">
                {exps.map(e => (
                  <div key={e.id} className="cv-tl-item">
                    <div className="cv-tl-dot" />
                    <div className="cv-tl-content">
                      <div className="cv-entry-head">
                        <strong className="cv-entry-title">
                          {e.poste}{e.entreprise ? ` — ${e.entreprise}` : ''}
                        </strong>
                        <DateRange debut={e.debut} fin={e.fin} />
                      </div>
                      <Desc text={e.description} />
                    </div>
                  </div>
                ))}
              </div>
            </MainSection>
          )}

          {/* Formation */}
          {forms.length > 0 && (
            <MainSection icon={<GradIcon />} title="Formation">
              <div className="cv-timeline">
                {forms.map(f => (
                  <div key={f.id} className="cv-tl-item">
                    <div className="cv-tl-dot" />
                    <div className="cv-tl-content">
                      <div className="cv-entry-head">
                        <strong className="cv-entry-title">
                          {f.diplome || f.ecole}
                          {f.diplome && f.ecole ? <><br /><span className="cv-entry-school">{f.ecole}</span></> : ''}
                        </strong>
                        <DateRange debut={f.debut} fin={f.fin} />
                      </div>
                      <Desc text={f.description} />
                    </div>
                  </div>
                ))}
              </div>
            </MainSection>
          )}

        </main>
      </div>
    </div>
  )
}
