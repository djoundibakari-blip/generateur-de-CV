const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)

export default function SkillsTab({ items, onAdd, onUpdate, onRemove }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Compétences</span>
        {items.length > 0 && (
          <span className="section-count">{items.length} compétence{items.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">⚡</div>
          <p className="empty-msg">Aucune compétence ajoutée.<br />Ajoutez vos technologies et savoir-faire.</p>
        </div>
      )}

      {items.map((c, idx) => (
        <div key={c.id} className="item-card">
          <div className="item-card-top">
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 'auto' }}>
              Compétence {idx + 1}
            </span>
            <button type="button" className="btn-remove" onClick={() => onRemove(c.id)}>
              <TrashIcon /> Supprimer
            </button>
          </div>

          <div className="field">
            <label className="field-label">Compétence</label>
            <input
              type="text" className="field-input"
              placeholder="ex : JavaScript, React, PHP…"
              value={c.nom}
              onChange={e => onUpdate(c.id, 'nom', e.target.value)}
            />
          </div>

          <div className="field">
            <label className="field-label">Niveau</label>
            <div className="level-row">
              {LEVELS.map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  className={`level-badge${c.niveau === lvl ? ' active' : ''}`}
                  onClick={() => onUpdate(c.id, 'niveau', c.niveau === lvl ? '' : lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={onAdd}>
        + Ajouter une compétence
      </button>
    </div>
  )
}
