import { useRef, useState, useEffect } from 'react'
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

const mkId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export default function ImportModal({ onClose, onApply }) {
  const [text, setText]           = useState('')
  const [parsed, setParsed]       = useState(null)
  const [parsedBy, setParsedBy]   = useState('') // 'regex' | 'ai'
  const [loading, setLoading]     = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [dragOver, setDragOver]   = useState(false)

  /* AI state */
  const [models, setModels]       = useState([])
  const [model, setModel]         = useState('')
  const [modelsErr, setModelsErr] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError]     = useState('')

  const fileRef = useRef()

  useEffect(() => {
    fetch('/api/ollama?action=models')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setModelsErr(d.error); return }
        setModels(d.models || [])
        if (d.models?.length) setModel(d.models[0])
      })
      .catch(() => setModelsErr('Ollama non disponible'))
  }, [])

  /* ── Regex parsing ── */
  const analyzeRegex = () => { setParsed(parseCV(text)); setParsedBy('regex') }

  /* ── AI parsing ── */
  const analyzeAI = async () => {
    if (!text.trim() || !model) return
    setAiLoading(true)
    setAiError('')
    try {
      const res  = await fetch('/api/ollama', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'parse', cvText: text, model }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Erreur IA')

      /* Add IDs to all array items */
      const enriched = {
        personal: {
          prenom: '', nom: '', headline: '', email: '',
          telephone: '', resume: '', localisation: '', github: '',
          photoUrl: null, photoFile: null,
          ...(data.personal || {}),
        },
        experiences: (data.experiences || []).map(e => ({
          id: mkId(), poste: '', entreprise: '', debut: '', fin: '', description: '', ...e,
        })),
        formations: (data.formations || []).map(f => ({
          id: mkId(), diplome: '', ecole: '', debut: '', fin: '', description: '', ...f,
        })),
        competences: (data.competences || []).map(c => ({
          id: mkId(), nom: '', niveau: '', ...c,
        })),
        qualites: (data.qualites || []).map(q => ({
          id: mkId(), nom: '', ...(typeof q === 'string' ? { nom: q } : q),
        })),
        langues: (data.langues || []).map(l => ({
          id: mkId(), nom: '', niveau: '', ...(typeof l === 'string' ? { nom: l } : l),
        })),
        passions: (data.passions || []).map(p => ({
          id: mkId(), nom: '', ...(typeof p === 'string' ? { nom: p } : p),
        })),
      }
      setParsed(enriched)
      setParsedBy('ai')
    } catch (e) {
      setAiError(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  const apply = () => { onApply(parsed); onClose() }
  const reset = () => { setParsed(null); setParsedBy(''); setAiError('') }

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(ext)
    setLoadingMsg(isImage ? 'Reconnaissance du texte (OCR)…' : 'Extraction en cours…')
    setLoading(true)
    try {
      const extracted = await extractTextFromFile(file)
      setText(extracted)
      // Ne pas auto-parser : laisser l'utilisateur choisir regex ou IA
    } catch (err) {
      alert(err.message || 'Impossible de lire ce fichier.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
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

        {/* ── INPUT PHASE ── */}
        {!parsed && !aiLoading && (
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
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/>
                  </svg>
                  <div>
                    <div className="dropzone-title">Glisser votre CV ici ou <span className="dropzone-link">cliquer pour choisir</span></div>
                    <div className="dropzone-hint">PDF, DOCX, PNG, JPG, TXT acceptés</div>
                  </div>
                </div>
              )}
            </div>

            {/* Indicateur qualité texte extrait */}
            {text.length > 30 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 6, marginBottom: 4, fontSize: 12,
                background: text.length > 800
                  ? 'rgba(92,224,138,.1)' : 'rgba(224,192,92,.1)',
                border: `1px solid ${text.length > 800 ? 'rgba(92,224,138,.3)' : 'rgba(224,192,92,.3)'}`,
                color: 'var(--text-muted)',
              }}>
                <span>{text.length > 800 ? '✓' : '⚠'}</span>
                <span>
                  <strong>{text.length} caractères</strong> extraits —{' '}
                  {text.length > 800
                    ? 'texte suffisant pour l\'IA'
                    : 'peu de texte extrait — le PDF est peut-être protégé ou en image'}
                </span>
              </div>
            )}

            <div className="modal-divider"><span>ou coller le texte manuellement</span></div>

            <textarea
              className="field-input modal-textarea"
              placeholder={`Jean Dupont\nDéveloppeur Web Full-Stack\njean@email.com  •  06 12 34 56 78\n\nPROFIL\nDéveloppeur passionné avec 3 ans d'expérience...\n\nEXPÉRIENCES\n2022 - présent  Développeur Front-End — Acme Corp\n\nFORMATIONS\n2019 - 2022  Bachelor Informatique — Epitech\n\nCOMPÉTENCES\nReact, PHP, Node.js, Figma`}
              value={text}
              onChange={e => setText(e.target.value)}
              rows={10}
            />

            {/* AI model selector */}
            {models.length > 0 && (
              <div className="adapt-model-field" style={{ marginTop: 8 }}>
                <span className="adapt-model-label">Modèle IA</span>
                <select className="adapt-model-select" value={model} onChange={e => setModel(e.target.value)}>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            {modelsErr && (
              <div style={{
                background: 'rgba(224,192,92,.1)', border: '1px solid rgba(224,192,92,.3)',
                borderRadius: 6, padding: '8px 12px', fontSize: 12,
                display: 'flex', gap: 8, alignItems: 'center', marginTop: 6,
              }}>
                <span>⚠️</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  IA non disponible (Ollama local). Utilisez <strong>Analyser</strong> pour l'analyse rapide.
                </span>
              </div>
            )}

            {aiError && <p className="adapt-url-error" style={{ marginTop: 6 }}>{aiError}</p>}

            <div className="modal-footer">
              <span className="modal-chars">{text.length} caractères</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-secondary"
                  onClick={analyzeRegex}
                  disabled={text.trim().length < 30 || loading}
                  title="Analyse rapide par expressions régulières"
                >
                  Analyser
                </button>
                <button
                  className="btn-export"
                  onClick={analyzeAI}
                  disabled={text.trim().length < 30 || loading || !model || !!modelsErr}
                  title={modelsErr || 'L\'IA organise intelligemment toutes les sections'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Analyser avec l'IA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AI LOADING PHASE ── */}
        {aiLoading && (
          <div className="modal-body">
            <div className="file-dropzone" style={{ cursor: 'default', minHeight: 130 }}>
              <div className="dropzone-inner">
                <span className="adapt-spin-icon">⚙</span>
                <div>
                  <div className="dropzone-title">L'IA analyse et organise votre CV…</div>
                  <div className="dropzone-hint">Modèle : <strong>{model}</strong> — 60 à 120 secondes</div>
                </div>
              </div>
            </div>
            <div className="ef-list" style={{ marginTop: 8 }}>
              {['Lecture du texte brut', 'Identification des sections', 'Structuration des données', 'Finalisation…'].map((s, i) => (
                <div key={i} className="ef-row ef-ok" style={{ opacity: i > 1 ? .35 : 1 }}>
                  <span className="ef-dot">{i < 2 ? '✓' : '…'}</span>
                  <span className="ef-val">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULT PHASE ── */}
        {parsed && !aiLoading && (
          <div className="modal-body">
            <p className="modal-hint">
              {parsedBy === 'ai'
                ? <><strong style={{ color: 'var(--primary)' }}>✨ Analyse IA</strong> — voici ce que l'IA a structuré :</>
                : 'Voici ce que j\'ai détecté dans le texte :'
              }
            </p>

            <div className="ef-list">
              <div className="ef-group">
                <div className="ef-group-title">Informations personnelles</div>
                <Field label="Prénom"    value={parsed.personal.prenom} />
                <Field label="Nom"       value={parsed.personal.nom} />
                <Field label="Titre"     value={parsed.personal.headline} />
                <Field label="Email"     value={parsed.personal.email} />
                <Field label="Téléphone" value={parsed.personal.telephone} />
                <Field label="Ville"     value={parsed.personal.localisation} />
                <Field label="GitHub"    value={parsed.personal.github} />
                <Field label="Résumé"    value={parsed.personal.resume ? parsed.personal.resume.slice(0, 80) + '…' : ''} />
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
