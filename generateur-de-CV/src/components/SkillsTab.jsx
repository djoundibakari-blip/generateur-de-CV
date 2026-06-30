const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)

const SKILL_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']

function SimpleListSection({ title, icon, items, onAdd, onUpdate, onRemove, addLabel, placeholder, emptyMsg }) {
  return (
    <div className="skills-section">
      <div className="section-header">
        <span className="section-title">{icon} {title}</span>
        {items.length > 0 && <span className="section-count">{items.length}</span>}
      </div>
      {items.map((item, idx) => (
        <div key={item.id} className="item-card skill-mini-card">
          <div className="skill-mini-row">
            <input
              type="text" className="field-input"
              placeholder={placeholder}
              value={item.nom}
              onChange={e => onUpdate(item.id, 'nom', e.target.value)}
            />
            <button type="button" className="btn-remove btn-remove-inline" onClick={() => onRemove(item.id)} title="Supprimer">
              <TrashIcon />
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="skills-empty">{emptyMsg}</p>
      )}
      <button type="button" className="btn-add" onClick={onAdd}>+ {addLabel}</button>
    </div>
  )
}

export default function SkillsTab({
  items, onAdd, onUpdate, onRemove,
  qualites, onAddQual, onUpdateQual, onRemoveQual,
  langues,  onAddLang, onUpdateLang, onRemoveLang,
  passions, onAddPass, onUpdatePass, onRemovePass,
}) {
  return (
    <div>
      {/* ── Compétences techniques ── */}
      <div className="skills-section">
        <div className="section-header">
          <span className="section-title">⚡ Compétences</span>
          {items.length > 0 && <span className="section-count">{items.length}</span>}
        </div>
        {items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <p className="empty-msg">Aucune compétence.<br/>Ajoutez vos technologies.</p>
          </div>
        )}
        {items.map((c, _idx) => (
          <div key={c.id} className="item-card">
            <div className="item-card-top">
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 'auto' }}>
                Compétence {_idx + 1}
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
                {SKILL_LEVELS.map(lvl => (
                  <button key={lvl} type="button"
                    className={`level-badge${c.niveau === lvl ? ' active' : ''}`}
                    onClick={() => onUpdate(c.id, 'niveau', c.niveau === lvl ? '' : lvl)}
                  >{lvl}</button>
                ))}
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn-add" onClick={onAdd}>+ Ajouter une compétence</button>
      </div>

      <div className="skills-divider" />

      {/* ── Qualités ── */}
      <SimpleListSection
        title="Qualités" icon="✨"
        items={qualites} onAdd={onAddQual} onUpdate={onUpdateQual} onRemove={onRemoveQual}
        addLabel="Ajouter une qualité"
        placeholder="ex : Autonome, Rigoureux…"
        emptyMsg="ex : Autonome, Curieux, Travail en équipe…"
      />

      <div className="skills-divider" />

      {/* ── Langues ── */}
      <div className="skills-section">
        <div className="section-header">
          <span className="section-title">🌍 Langues</span>
          {langues.length > 0 && <span className="section-count">{langues.length}</span>}
        </div>
        {langues.length === 0 && (
          <p className="skills-empty">ex : Français (natif), Anglais (B2)…</p>
        )}
        {langues.map(l => (
          <div key={l.id} className="item-card skill-mini-card">
            <div className="skill-mini-row">
              <input
                type="text" className="field-input"
                placeholder="Langue (ex : Anglais)"
                value={l.nom}
                onChange={e => onUpdateLang(l.id, 'nom', e.target.value)}
                style={{ flex: 2 }}
              />
              <input
                type="text" className="field-input"
                placeholder="Niveau (ex : B2)"
                value={l.niveau}
                onChange={e => onUpdateLang(l.id, 'niveau', e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn-remove btn-remove-inline" onClick={() => onRemoveLang(l.id)} title="Supprimer">
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn-add" onClick={onAddLang}>+ Ajouter une langue</button>
      </div>

      <div className="skills-divider" />

      {/* ── Passions ── */}
      <SimpleListSection
        title="Passions" icon="❤️"
        items={passions} onAdd={onAddPass} onUpdate={onUpdatePass} onRemove={onRemovePass}
        addLabel="Ajouter une passion"
        placeholder="ex : Mangas, Jeux vidéo…"
        emptyMsg="ex : Musique, Sport, Lecture…"
      />
    </div>
  )
}
