const TABS = [
  { id: 'personal',   label: 'Profil',       icon: '👤' },
  { id: 'experience', label: 'Expériences',  icon: '💼' },
  { id: 'projects',   label: 'Projets',      icon: '🚀' },
  { id: 'education',  label: 'Formations',   icon: '🎓' },
  { id: 'skills',     label: 'Compétences',  icon: '⚡' },
]

function isComplete(tab, cv) {
  if (tab === 'personal')   return !!(cv.personal.prenom || cv.personal.nom)
  if (tab === 'experience') return cv.experiences.some(e => e.poste)
  if (tab === 'projects')   return (cv.projets||[]).some(p => p.nom)
  if (tab === 'education')  return cv.formations.some(f => f.diplome)
  if (tab === 'skills')     return cv.competences.some(c => c.nom) || (cv.qualites||[]).some(q => q.nom) || (cv.langues||[]).some(l => l.nom) || (cv.passions||[]).some(p => p.nom)
  return false
}

export default function TabNav({ active, onChange, cv }) {
  return (
    <nav className="tab-nav" role="tablist">
      {TABS.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`tab-btn${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="tab-icon">{t.icon}</span>
          <span className="tab-label">{t.label}</span>
          {isComplete(t.id, cv) && <span className="tab-dot" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  )
}
