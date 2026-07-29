import { useState, useEffect, useRef } from 'react'
import { extractTextFromFile } from '../utils/extractCV.js'
import { FileTextIcon, AlertTriangleIcon, Spinner } from './icons.jsx'

export default function CoverLetterModal({ cv, onClose }) {
  const [models, setModels]   = useState([])
  const [model, setModel]     = useState('')
  const [modelsErr, setModelsErr] = useState('')

  const [jobOffer, setJobOffer] = useState('')
  // phase: input | extracting | loading | result | error
  const [phase, setPhase]     = useState('input')
  const [lettre, setLettre]   = useState('')
  const [errMsg, setErrMsg]   = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [extractMsg, setExtractMsg] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [copied, setCopied] = useState(false)

  const fileRef = useRef(null)

  useEffect(() => {
    fetch('/api/ollama?action=models')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setModelsErr(d.error); return }
        const list = d.models || []
        setModels(list)
        setModel(list.find(m => m.startsWith('qwen2.5:7b')) || list.find(m => m.startsWith('mistral')) || list[0] || '')
      })
      .catch(() => setModelsErr('Impossible de contacter Ollama. Lancez : ollama serve'))
  }, [])

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    setExtractMsg(['png','jpg','jpeg','webp'].includes(ext) ? 'Reconnaissance du texte (OCR)…' : 'Extraction en cours…')
    setPhase('extracting')
    try {
      const text = await extractTextFromFile(file)
      setJobOffer(text.trim())
      setPhase('input')
    } catch (err) {
      setErrMsg(err.message || 'Impossible de lire ce fichier.')
      setPhase('error')
    }
  }
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }

  const handleUrl = async () => {
    const url = urlInput.trim()
    if (!url) return
    setUrlLoading(true); setUrlError('')
    try {
      const res  = await fetch('/api/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error)
      setJobOffer(data.text); setUrlInput('')
    } catch (e) { setUrlError(e.message) }
    finally { setUrlLoading(false) }
  }

  const handleGenerate = async () => {
    if (!jobOffer.trim()) return
    setErrMsg('')
    setPhase('loading')
    try {
      const res  = await fetch('/api/ollama', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cover_letter', cv, jobOffer, model }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        const msg = typeof data.error === 'string' ? data.error : 'Erreur inconnue'
        throw new Error(msg)
      }
      setLettre(data.lettre || '')
      setPhase('result')
    } catch (e) { setErrMsg(e?.message || String(e) || 'Erreur inconnue'); setPhase('error') }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lettre)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard indisponible, tant pis */ }
  }

  const genSteps = ['Lecture du CV et de l\'offre', 'Rédaction de la lettre', 'Finalisation…']

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">

        <div className="modal-head">
          <div className="modal-head-left">
            <span className="modal-icon"><FileTextIcon size={22} strokeWidth={1.6} /></span>
            <div>
              <div className="modal-title">Lettre de motivation</div>
              <div className="modal-sub">L'IA rédige une lettre à partir de votre CV et de l'offre</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {(phase === 'input' || phase === 'extracting') && (
          <div className="modal-body">

            {modelsErr && (
              <div className="adapt-ollama-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Ollama non disponible, lancez <code>ollama serve</code> dans un terminal
              </div>
            )}

            {!cv?.personal?.prenom && !cv?.personal?.nom && !cv?.experiences?.length && (
              <div style={{
                background: 'rgba(224,192,92,.12)', border: '1px solid rgba(224,192,92,.35)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4,
              }}>
                <AlertTriangleIcon size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong style={{ color: '#E0C05C' }}>CV vide détecté</strong>
                  <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                    Remplissez d'abord votre profil et vos expériences pour une lettre pertinente.
                  </div>
                </div>
              </div>
            )}

            {models.length > 0 && (
              <div className="adapt-model-field">
                <span className="adapt-model-label" title="Modèle utilisé pour la rédaction">
                  <FileTextIcon size={12} strokeWidth={1.6} /> Rédaction
                </span>
                <select className="adapt-model-select" value={model} onChange={e => setModel(e.target.value)}>
                  {models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            <div className="modal-divider"><span>offre d'emploi</span></div>

            <div className="adapt-url-row">
              <div className="adapt-url-input-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .5, flexShrink: 0 }}>
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
                <input
                  className="adapt-url-input" type="url"
                  placeholder="Coller le lien de l'offre (Welcome to the Jungle, Indeed, Monster…)"
                  value={urlInput}
                  onChange={e => { setUrlInput(e.target.value); setUrlError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleUrl()}
                />
              </div>
              <button className="adapt-url-btn" onClick={handleUrl} disabled={!urlInput.trim() || urlLoading}>
                {urlLoading
                  ? <span className="adapt-url-spinner" />
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                }
                {urlLoading ? 'Chargement…' : 'Récupérer'}
              </button>
            </div>
            {urlError && <p className="adapt-url-error"><AlertTriangleIcon size={13} strokeWidth={2} />{urlError}</p>}

            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div
              className={`file-dropzone${dragOver ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
            >
              {phase === 'extracting' ? (
                <div className="dropzone-inner">
                  <Spinner size={22} />
                  <div>
                    <div className="dropzone-title">{extractMsg}</div>
                    <div className="dropzone-hint">Cela peut prendre quelques secondes…</div>
                  </div>
                </div>
              ) : (
                <div className="dropzone-inner">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .5 }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="12"/><line x1="15" y1="15" x2="12" y2="12"/>
                  </svg>
                  <div>
                    <div className="dropzone-title">Glisser l'offre ici ou <span className="dropzone-link">cliquer pour choisir</span></div>
                    <div className="dropzone-hint">PDF, DOCX, TXT, PNG, JPG acceptés</div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-divider"><span>ou coller le texte</span></div>
            <textarea
              className="field-input modal-textarea"
              placeholder={`Développeur React Senior chez Acme Corp\n\nMissions :\n- Développer des composants React\n- Concevoir des APIs RESTful\n\nProfil :\n- 2 ans d'expérience minimum\n- Maîtrise React, TypeScript, SQL`}
              value={jobOffer}
              onChange={e => setJobOffer(e.target.value)}
              rows={8}
            />

            <div className="modal-footer">
              <span className="modal-chars">{jobOffer.length} car.</span>
              <button
                className="btn-export"
                onClick={handleGenerate}
                disabled={!jobOffer.trim() || !model || !!modelsErr || phase === 'extracting'}
              >
                <FileTextIcon size={14} strokeWidth={1.8} />
                Générer la lettre
              </button>
            </div>
          </div>
        )}

        {phase === 'loading' && (
          <div className="modal-body">
            <div className="file-dropzone" style={{ cursor: 'default', minHeight: 110 }}>
              <div className="dropzone-inner">
                <Spinner size={22} />
                <div>
                  <div className="dropzone-title">L'IA rédige votre lettre…</div>
                  <div className="dropzone-hint">Modèle : <strong>{model}</strong> (30 à 90 secondes)</div>
                </div>
              </div>
            </div>
            <div className="ef-list" style={{ marginTop: 8 }}>
              {genSteps.map((s, i) => (
                <div key={i} className={`ef-row ${i < 2 ? 'ef-ok' : 'ef-miss'}`} style={{ opacity: i >= 2 ? .35 : 1, transition: 'opacity .4s' }}>
                  <span className="ef-dot">{i < 1 ? '✓' : i === 1 ? '…' : '○'}</span>
                  <span className="ef-val">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="modal-body">
            <p className="modal-hint">Votre lettre de motivation :</p>
            <div className="field-input modal-textarea" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, cursor: 'text', maxHeight: 360, overflowY: 'auto' }}>
              {lettre}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setPhase('input'); setLettre('') }}>← Régénérer</button>
              <button className="btn-export" onClick={handleCopy}>
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                )}
                {copied ? 'Copié !' : 'Copier le texte'}
              </button>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="modal-body">
            <div className="file-dropzone" style={{ cursor: 'default', borderColor: 'rgba(224,92,92,.4)' }}>
              <div className="dropzone-inner">
                <AlertTriangleIcon size={26} strokeWidth={1.6} style={{ color: '#E07070', flexShrink: 0 }} />
                <div>
                  <div className="dropzone-title" style={{ color: '#E07070' }}>Erreur</div>
                  <div className="dropzone-hint">{errMsg}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={onClose}>Fermer</button>
              <button className="btn-export" onClick={() => setPhase('input')}>Réessayer</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
