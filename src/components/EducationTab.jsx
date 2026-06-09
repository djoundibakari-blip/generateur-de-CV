const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)

export default function EducationTab({ items, onAdd, onUpdate, onRemove }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Formations</span>
        {items.length > 0 && (
          <span className="section-count">{items.length} entrée{items.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎓</div>
          <p className="empty-msg">Aucune formation ajoutée.<br />Cliquez ci-dessous pour commencer.</p>
        </div>
      )}

      {items.map((f, idx) => (
        <div key={f.id} className="item-card">
          <div className="item-card-top">
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 'auto' }}>
              Formation {idx + 1}
            </span>
            <button type="button" className="btn-remove" onClick={() => onRemove(f.id)}>
              <TrashIcon /> Supprimer
            </button>
          </div>

          <div className="row-2">
            <div className="field">
              <label className="field-label">Diplôme / Formation</label>
              <input
                type="text" className="field-input"
                placeholder="Bachelor Informatique"
                value={f.diplome}
                onChange={e => onUpdate(f.id, 'diplome', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Établissement</label>
              <input
                type="text" className="field-input"
                placeholder="Epitech"
                value={f.ecole}
                onChange={e => onUpdate(f.id, 'ecole', e.target.value)}
              />
            </div>
          </div>

          <div className="row-2">
            <div className="field">
              <label className="field-label">Date de début</label>
              <input
                type="month" className="field-input"
                value={f.debut}
                onChange={e => onUpdate(f.id, 'debut', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Date de fin</label>
              <input
                type="month" className="field-input"
                placeholder="En cours"
                value={f.fin}
                onChange={e => onUpdate(f.id, 'fin', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Description (mention, spécialité…)</label>
            <textarea
              className="field-input"
              placeholder="Mention Bien, spécialité développement web…"
              value={f.description}
              onChange={e => onUpdate(f.id, 'description', e.target.value)}
              rows={2}
            />
          </div>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={onAdd}>
        + Ajouter une formation
      </button>
    </div>
  )
}
