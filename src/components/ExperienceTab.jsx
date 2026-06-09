const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)

export default function ExperienceTab({ items, onAdd, onUpdate, onRemove }) {
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Expériences</span>
        {items.length > 0 && (
          <span className="section-count">{items.length} entrée{items.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <p className="empty-msg">Aucune expérience ajoutée.<br />Cliquez ci-dessous pour commencer.</p>
        </div>
      )}

      {items.map((exp, idx) => (
        <div key={exp.id} className="item-card">
          <div className="item-card-top">
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 'auto' }}>
              Expérience {idx + 1}
            </span>
            <button type="button" className="btn-remove" onClick={() => onRemove(exp.id)}>
              <TrashIcon /> Supprimer
            </button>
          </div>

          <div className="row-2">
            <div className="field">
              <label className="field-label">Intitulé du poste</label>
              <input
                type="text" className="field-input"
                placeholder="Développeur Front-End"
                value={exp.poste}
                onChange={e => onUpdate(exp.id, 'poste', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Entreprise</label>
              <input
                type="text" className="field-input"
                placeholder="Acme Corp"
                value={exp.entreprise}
                onChange={e => onUpdate(exp.id, 'entreprise', e.target.value)}
              />
            </div>
          </div>

          <div className="row-2">
            <div className="field">
              <label className="field-label">Date de début</label>
              <input
                type="month" className="field-input"
                value={exp.debut}
                onChange={e => onUpdate(exp.id, 'debut', e.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label">Date de fin</label>
              <input
                type="month" className="field-input"
                placeholder="En cours"
                value={exp.fin}
                onChange={e => onUpdate(exp.id, 'fin', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Description des missions</label>
            <textarea
              className="field-input"
              placeholder="Décrivez vos responsabilités et réalisations…"
              value={exp.description}
              onChange={e => onUpdate(exp.id, 'description', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      ))}

      <button type="button" className="btn-add" onClick={onAdd}>
        + Ajouter une expérience
      </button>
    </div>
  )
}
