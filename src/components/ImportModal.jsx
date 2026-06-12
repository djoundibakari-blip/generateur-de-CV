import { useRef, useState } from 'react'
import { parseCV } from '../utils/parseCV.js'
import { extractTextFromFile } from '../utils/extractCV.js'

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
      <span className="ef-val">
        {count > 0 ? `${count} entrée${count > 1 ? 's' : ''} détectée${count > 1 ? 's' : ''}` : <em>non détecté</em>}
      </span>
    </div>
  )
}

export default function ImportModal({ onClose, onApply }) {
  const [text, setText]       = useState('')
  const [parsed, setParsed]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef()

  const analyze = () => setParsed(parseCV(text))
  const apply   = () => { onApply(parsed); onClose() }
  const reset   = () => setParsed(null)

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(ext)
    setLoadingMsg(isImage ? 'Reconnaissance du texte (OCR)…' : 'Extraction en cours…')
    setLoading(true)
    try {
      const extracted = await extractTextFromFile(file)
      setText(extracted)
      if (extracted.trim().length >= 30) {
        setParsed(parseCV(extracted))
      }
    } catch (err) {
      alert(err.message || 'Impossible de lire ce fichier.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {!parsed ? (
          <div className="modal-body">
            {/* File drop zone */}
            <div
              className={`file-dropzone${dragOver ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
              {loading ? (
                <div className="dropzone-inner">
                  <span className="dropzone-spinner">⏳</span>
                  <div>
                    <div className="dropzone-title">{loadingMsg}</div>
                    <div className="dropzone-hint">Cela peut prendre quelques secondes…</div>
                  </div>
                </div>
              ) : (
                <div className="dropzone-inner">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .5 }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/>
                  </svg>
                  <div>
                    <div className="dropzone-title">Glisser votre CV ici ou <span className="dropzone-link">cliquer pour choisir</span></div>
                    <div className="dropzone-hint">PDF, DOCX, PNG, JPG, TXT acceptés</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-divider"><span>ou coller le texte</span></div>

            <textarea
              className="field-input modal-textarea"
              placeholder={`Jean Dupont\nDéveloppeur Web Full-Stack\njean@email.com  •  06 12 34 56 78\n\nPROFIL\nDéveloppeur passionné avec 3 ans d'expérience...\n\nEXPÉRIENCES\n2022 - présent  Développeur Front-End — Acme Corp\n\nFORMATIONS\n2019 - 2022  Bachelor Informatique — Epitech\n\nCOMPÉTENCES\nReact, PHP, Node.js, Figma`}
              value={text}
              onChange={e => setText(e.target.value)}
              rows={10}
            />
            <div className="modal-footer">
              <span className="modal-chars">{text.length} caractères</span>
              <button
                className="btn-export"
                onClick={analyze}
                disabled={text.trim().length < 30 || loading}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Analyser le CV
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <p className="modal-hint">Voici ce que j'ai détecté dans le texte :</p>

            <div className="ef-list">
              <div className="ef-group">
                <div className="ef-group-title">Informations personnelles</div>
                <Field label="Prénom"      value={parsed.personal.prenom} />
                <Field label="Nom"         value={parsed.personal.nom} />
                <Field label="Titre"       value={parsed.personal.headline} />
                <Field label="Email"       value={parsed.personal.email} />
                <Field label="Téléphone"   value={parsed.personal.telephone} />
                <Field label="Ville"       value={parsed.personal.localisation} />
                <Field label="GitHub"      value={parsed.personal.github} />
                <Field label="Résumé"      value={parsed.personal.resume ? parsed.personal.resume.slice(0, 80) + '…' : ''} />
              </div>
              <div className="ef-group">
                <div className="ef-group-title">Contenu du CV</div>
                <CountField label="Expériences"  count={parsed.experiences.length} />
                <CountField label="Formations"   count={parsed.formations.length} />
                <CountField label="Compétences"  count={parsed.competences.length} />
                <CountField label="Qualités"     count={(parsed.qualites||[]).length} />
                <CountField label="Langues"      count={(parsed.langues||[]).length} />
                <CountField label="Passions"     count={(parsed.passions||[]).length} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={reset}>← Modifier</button>
              <button className="btn-export" onClick={apply}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Appliquer au formulaire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
