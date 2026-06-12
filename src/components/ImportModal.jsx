import { useState } from 'react'
import { parseCV } from '../utils/parseCV.js'

function Field({ label, value }) {
  const ok = Boolean(value)
  return (
    <div className={`ef-row ${ok ? 'ef-ok' : 'ef-miss'}`}>
      <span className="ef-dot">{ok ? '✓' : '○'}</span>
      <span className="ef-label">{label}</span>
      <span className="ef-val">{ok ? value : <em>non détecté</em>}</span>
    </div>
  )
}

function CountField({ label, count }) {
  return (
    <div className={`ef-row ${count > 0 ? 'ef-ok' : 'ef-miss'}`}>
      <span className="ef-dot">{count > 0 ? '✓' : '○'}</span>
      <span className="ef-label">{label}</span>
      <span className="ef-val">{count > 0 ? `${count} entrée${count > 1 ? 's' : ''} détectée${count > 1 ? 's' : ''}` : <em>non détecté</em>}</span>
    </div>
  )
}

export default function ImportModal({ onClose, onApply }) {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null)

  const analyze = () => setParsed(parseCV(text))

  const apply = () => { onApply(parsed); onClose() }

  const reset = () => setParsed(null)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">

        {/* Header */}
        <div className="modal-head">
          <div className="modal-head-left">
            <span className="modal-icon">📄</span>
            <div>
              <div className="modal-title">Importer un CV existant</div>
              <div className="modal-sub">Le contenu sera extrait et adapté au modèle</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {!parsed ? (
          /* ── Step 1 : paste ── */
          <div className="modal-body">
            <p className="modal-hint">
              Collez le texte de votre CV ci-dessous — copié depuis Word, PDF, LinkedIn ou tout autre format.
              Les informations seront automatiquement extraites et adaptées au template.
            </p>
            <textarea
              className="field-input modal-textarea"
              placeholder={`Jean Dupont\nDéveloppeur Web Full-Stack\njean@email.com  •  06 12 34 56 78\n\nPROFIL\nDéveloppeur passionné avec 3 ans d'expérience...\n\nEXPÉRIENCES\n2022 - présent  Développeur Front-End — Acme Corp\n...\n\nFORMATIONS\n2019 - 2022  Bachelor Informatique — Epitech\n\nCOMPÉTENCES\nReact, PHP, Node.js, Figma`}
              value={text}
              onChange={e => setText(e.target.value)}
              rows={16}
            />
            <div className="modal-footer">
              <span className="modal-chars">{text.length} caractères</span>
              <button
                className="btn-export"
                onClick={analyze}
                disabled={text.trim().length < 30}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Analyser le CV
              </button>
            </div>
          </div>
        ) : (
          /* ── Step 2 : review ── */
          <div className="modal-body">
            <p className="modal-hint">Voici ce que j'ai détecté dans le texte :</p>

            <div className="ef-list">
              <div className="ef-group">
                <div className="ef-group-title">Informations personnelles</div>
                <Field label="Prénom"    value={parsed.personal.prenom} />
                <Field label="Nom"       value={parsed.personal.nom} />
                <Field label="Titre"     value={parsed.personal.headline} />
                <Field label="Email"     value={parsed.personal.email} />
                <Field label="Téléphone" value={parsed.personal.telephone} />
                <Field label="Résumé"    value={parsed.personal.resume ? parsed.personal.resume.slice(0, 80) + '…' : ''} />
              </div>
              <div className="ef-group">
                <div className="ef-group-title">Contenu du CV</div>
                <CountField label="Expériences"  count={parsed.experiences.length} />
                <CountField label="Formations"   count={parsed.formations.length} />
                <CountField label="Compétences"  count={parsed.competences.length} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={reset}>← Modifier le texte</button>
              <button className="btn-export" onClick={apply}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Appliquer au formulaire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
