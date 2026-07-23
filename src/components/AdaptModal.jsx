import { useState, useEffect, useRef } from 'react'
import { extractTextFromFile } from '../utils/extractCV.js'

export default function AdaptModal({ cv, onApply, onClose }) {
  const [mode, setMode]         = useState('analyze') // 'analyze' | 'adapt'
  const [models, setModels]     = useState([])
  const [adaptModel, setAdaptModel] = useState('')  // Agent 3 : gros modèle
  const [extractModel, setExtractModel] = useState('') // Agent 1/2 : petit modèle
  const [modelsErr, setModelsErr] = useState('')

  const [jobOffer, setJobOffer] = useState('')
  // phase: input | extracting_job | adapting | loading | result | error
  const [phase, setPhase]       = useState('input')
  const [agentLabel, setAgentLabel] = useState('')
  const [result, setResult]     = useState(null)
  const [resultTab, setResultTab] = useState('comparaison')
  const [errMsg, setErrMsg]     = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [extractMsg, setExtractMsg] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')

  const fileRef  = useRef(null)
  const timerRef = useRef(null)

  /* ── Auto-sélection des modèles ──
     qwen2.5:3b → extraction rapide (Agents 1 & 2)
     qwen2.5:7b ou mistral → adaptation (Agent 3) */
  useEffect(() => {
    fetch('/api/ollama?action=models')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setModelsErr(d.error); return }
        const list = d.models || []
        setModels(list)

        const small = list.find(m => m.startsWith('qwen2.5:3b'))
                   || list.find(m => m.startsWith('mistral'))
                   || list[0] || ''
        const large = list.find(m => m.startsWith('qwen2.5:7b'))
                   || list.find(m => m.startsWith('mistral'))
                   || list[0] || ''

        setExtractModel(small)
        setAdaptModel(large)
      })
      .catch(() => setModelsErr('Impossible de contacter Ollama. Lancez : ollama serve'))
  }, [])

  const switchMode = (m) => { setMode(m); setPhase('input'); setResult(null); setErrMsg(''); setJobOffer('') }

  /* ── File drop (offre d'emploi) ── */
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

  /* ── URL scraping ── */
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

  /* ════════════════════════════════════════════════
     ORCHESTRATION PRINCIPALE
     Analyze  → 1 appel  (Agent analyze)
     Adapt    → 2 appels séquentiels (Agent 2 → Agent 3)
  ════════════════════════════════════════════════ */
  const handleRun = async () => {
    setErrMsg('')

    /* ── MODE ANALYZE ── */
    if (mode === 'analyze') {
      setPhase('loading')
      setAgentLabel(`IA analyse votre CV… (${adaptModel})`)
      try {
        const res  = await fetch('/api/ollama', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'analyze', cv, model: adaptModel }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          const msg = typeof data.error === 'string' ? data.error : 'Erreur inconnue'
          throw new Error(msg)
        }
        setResult(data); setPhase('result')
      } catch (e) { setErrMsg(e?.message || String(e) || 'Erreur inconnue'); setPhase('error') }
      return
    }

    /* ── MODE ADAPT : 2 agents séquentiels ── */
    if (!jobOffer.trim()) return

    try {
      /* ─ Agent 2 : extraction de l'offre ─ */
      setPhase('extracting_job')
      setAgentLabel(`Agent 2 — Extraction de l'offre (${extractModel})`)

      const r1   = await fetch('/api/ollama', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract_job', jobOffer, model: extractModel }),
      })
      const jobRequirements = await r1.json()
      if (!r1.ok || jobRequirements.error) {
        const msg = typeof jobRequirements.error === 'string' ? jobRequirements.error : 'Erreur Agent 2'
        throw new Error(msg)
      }

      /* ─ Agent 3 : adaptation du CV ─ */
      setPhase('adapting')
      setAgentLabel(`Agent 3 — Adaptation du CV (${adaptModel})`)

      const r2   = await fetch('/api/ollama', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'adapt', cv, jobRequirements, model: adaptModel }),
      })
      const adapted = await r2.json()
      if (!r2.ok || adapted.error) {
        const msg = typeof adapted.error === 'string' ? adapted.error : 'Erreur Agent 3'
        throw new Error(msg)
      }

      setResult(adapted); setPhase('result')
    } catch (e) { setErrMsg(e?.message || String(e) || 'Erreur inconnue'); setPhase('error') }
  }

  const handleApply = () => { onApply(result); onClose() }
  const scoreColor  = (s) => s >= 70 ? '#5CE08A' : s >= 40 ? '#E0C05C' : '#E07070'

  /* ── Steps visuels par phase ── */
  const analyzeSteps = ['Lecture du CV', 'Évaluation du contenu', 'Identification des axes', 'Finalisation…']
  const extractSteps = ['Lecture de l\'offre', 'Identification des exigences clés', 'Structuration JSON…']
  const adaptSteps   = ['Lecture des exigences', 'Reformulation du résumé', 'Adaptation des expériences', 'Finalisation…']

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">

        {/* ── Header ── */}
        <div className="modal-head">
          <div className="modal-head-left">
            <span className="modal-icon">{mode === 'analyze' ? '🔍' : '✨'}</span>
            <div>
              <div className="modal-title">{mode === 'analyze' ? 'Analyser mon CV' : 'Adapter au poste'}</div>
              <div className="modal-sub">{mode === 'analyze' ? 'L\'IA évalue la qualité de votre CV' : 'L\'IA optimise votre CV pour l\'offre'}</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Mode toggle ── */}
        {phase === 'input' && (
          <div className="adapt-mode-toggle">
            <button className={`adapt-mode-btn${mode === 'analyze' ? ' active' : ''}`} onClick={() => switchMode('analyze')}>
              🔍 Analyser mon CV
            </button>
            <button className={`adapt-mode-btn${mode === 'adapt' ? ' active' : ''}`} onClick={() => switchMode('adapt')}>
              ✨ Adapter au poste
            </button>
          </div>
        )}

        {/* ══════════════ PHASE : INPUT ══════════════ */}
        {(phase === 'input' || phase === 'extracting') && (
          <div className="modal-body">

            {modelsErr && (
              <div className="adapt-ollama-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Ollama non disponible — lancez <code>ollama serve</code> dans un terminal
              </div>
            )}

            {/* Avertissement CV vide */}
            {!cv?.personal?.prenom && !cv?.personal?.nom &&
             !cv?.experiences?.length && !cv?.competences?.length && (
              <div style={{
                background: 'rgba(224,192,92,.12)', border: '1px solid rgba(224,192,92,.35)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4,
              }}>
                <span>⚠️</span>
                <div>
                  <strong style={{ color: '#E0C05C' }}>CV vide détecté</strong>
                  <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                    Importez d'abord votre CV via <strong>Importer un CV → Analyser avec l'IA</strong>, puis revenez ici pour l'adapter.
                    L'IA ne peut reformuler que ce qui existe déjà dans le formulaire.
                  </div>
                </div>
              </div>
            )}

            {/* Sélecteurs modèles */}
            {models.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {mode === 'adapt' && (
                  <div className="adapt-model-field" style={{ flex: 1, minWidth: 160 }}>
                    <span className="adapt-model-label" title="Agent 2 — Extraction offre (rapide)">⚡ Extraction</span>
                    <select className="adapt-model-select" value={extractModel} onChange={e => setExtractModel(e.target.value)}>
                      {models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}
                <div className="adapt-model-field" style={{ flex: 1, minWidth: 160 }}>
                  <span className="adapt-model-label" title={mode === 'adapt' ? 'Agent 3 — Adaptation CV (précis)' : 'Analyse qualité'}>
                    {mode === 'adapt' ? '✨ Adaptation' : '🔍 Analyse'}
                  </span>
                  <select className="adapt-model-select" value={adaptModel} onChange={e => setAdaptModel(e.target.value)}>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Analyze mode */}
            {mode === 'analyze' && (
              <div className="adapt-analyze-info">
                {['Résumé professionnel', 'Expériences et descriptions', 'Compétences, langues, formations'].map((s, i) => (
                  <div key={i} className="ef-row ef-ok" style={{ background: 'none', padding: '6px 0' }}>
                    <span className="ef-dot">✓</span><span className="ef-val">{s}</span>
                  </div>
                ))}
                <p className="adapt-analyze-hint">L'IA évalue votre CV et vous donne un score, vos points forts, faibles et des suggestions concrètes.</p>
              </div>
            )}

            {/* Adapt mode */}
            {mode === 'adapt' && (
              <>
                <div className="modal-divider"><span>offre d'emploi</span></div>

                {/* URL fetcher */}
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
                {urlError && <p className="adapt-url-error">{urlError}</p>}

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
                      <span className="dropzone-spinner">⏳</span>
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
                  placeholder={`Développeur React Senior — Acme Corp\n\nMissions :\n- Développer des composants React\n- Concevoir des APIs RESTful\n\nProfil :\n- 2 ans d'expérience minimum\n- Maîtrise React, TypeScript, SQL`}
                  value={jobOffer}
                  onChange={e => setJobOffer(e.target.value)}
                  rows={8}
                />
              </>
            )}

            <div className="modal-footer">
              <span className="modal-chars">
                {mode === 'adapt'
                  ? `${jobOffer.length} car.`
                  : `${cv.experiences?.length ?? 0} exp · ${cv.competences?.length ?? 0} comp.`}
              </span>
              <button
                className="btn-export"
                onClick={handleRun}
                disabled={
                  (!jobOffer.trim() && mode === 'adapt') ||
                  !adaptModel || !!modelsErr || phase === 'extracting'
                }
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                {mode === 'analyze' ? 'Analyser mon CV' : 'Lancer les 2 agents IA'}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ PHASE : AGENT 2 (extraction offre) ══════════════ */}
        {phase === 'extracting_job' && (
          <div className="modal-body">
            <div className="file-dropzone" style={{ cursor: 'default', minHeight: 110 }}>
              <div className="dropzone-inner">
                <span className="adapt-spin-icon">⚙</span>
                <div>
                  <div className="dropzone-title">Agent 2 — Analyse de l'offre…</div>
                  <div className="dropzone-hint">Modèle : <strong>{extractModel}</strong> — extraction des exigences</div>
                </div>
              </div>
            </div>
            <div className="ef-list" style={{ marginTop: 8 }}>
              {extractSteps.map((s, i) => (
                <div key={i} className={`ef-row ${i < 2 ? 'ef-ok' : 'ef-miss'}`} style={{ opacity: i >= 2 ? .35 : 1, transition: 'opacity .4s' }}>
                  <span className="ef-dot">{i < 1 ? '✓' : i === 1 ? '…' : '○'}</span>
                  <span className="ef-val" style={{ fontWeight: i === 1 ? 600 : 400 }}>{s}</span>
                </div>
              ))}
            </div>
            <div className="ef-list" style={{ marginTop: 4, opacity: .45 }}>
              <div className="ef-row ef-miss">
                <span className="ef-dot">○</span>
                <span className="ef-val">Agent 3 — Adaptation du CV (en attente)</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ PHASE : AGENT 3 (adaptation CV) ══════════════ */}
        {phase === 'adapting' && (
          <div className="modal-body">
            <div className="file-dropzone" style={{ cursor: 'default', borderColor: 'rgba(100,90,200,.4)', minHeight: 110 }}>
              <div className="dropzone-inner">
                <span className="adapt-spin-icon">⚙</span>
                <div>
                  <div className="dropzone-title">Agent 3 — Adaptation du CV…</div>
                  <div className="dropzone-hint">Modèle : <strong>{adaptModel}</strong> — reformulation ciblée</div>
                </div>
              </div>
            </div>
            <div className="ef-list" style={{ marginTop: 8 }}>
              <div className="ef-row ef-ok">
                <span className="ef-dot">✓</span>
                <span className="ef-val">Agent 2 terminé — exigences extraites</span>
              </div>
            </div>
            <div className="ef-list" style={{ marginTop: 4 }}>
              {adaptSteps.map((s, i) => (
                <div key={i} className={`ef-row ${i < 2 ? 'ef-ok' : 'ef-miss'}`} style={{ opacity: i >= 2 ? .35 : 1, transition: 'opacity .4s' }}>
                  <span className="ef-dot">{i < 1 ? '✓' : i === 1 ? '…' : '○'}</span>
                  <span className="ef-val" style={{ fontWeight: i === 1 ? 600 : 400 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ PHASE : LOADING (analyze) ══════════════ */}
        {phase === 'loading' && (
          <div className="modal-body">
            <div className="file-dropzone" style={{ cursor: 'default', minHeight: 110 }}>
              <div className="dropzone-inner">
                <span className="adapt-spin-icon">⚙</span>
                <div>
                  <div className="dropzone-title">L'IA analyse votre CV…</div>
                  <div className="dropzone-hint">Modèle : <strong>{adaptModel}</strong> — 30 à 90 secondes</div>
                </div>
              </div>
            </div>
            <div className="ef-list" style={{ marginTop: 8 }}>
              {analyzeSteps.map((s, i) => (
                <div key={i} className={`ef-row ${i < 2 ? 'ef-ok' : 'ef-miss'}`} style={{ opacity: i >= 2 ? .35 : 1, transition: 'opacity .4s' }}>
                  <span className="ef-dot">{i < 1 ? '✓' : i === 1 ? '…' : '○'}</span>
                  <span className="ef-val">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ PHASE : RESULT (analyze) ══════════════ */}
        {phase === 'result' && result && mode === 'analyze' && (
          <div className="modal-body">
            <p className="modal-hint">Diagnostic de votre CV :</p>
            <div className="ef-list">
              <div className="ef-group">
                <div className="ef-group-title">Score de qualité</div>
                <div className="ef-row ef-ok">
                  <span className="ef-dot" style={{ color: scoreColor(result.score ?? 0) }}>●</span>
                  <span className="ef-label">Qualité</span>
                  <span className="ef-val" style={{ fontWeight: 700, color: scoreColor(result.score ?? 0), fontSize: 15 }}>
                    {result.score ?? '—'} / 100
                  </span>
                </div>
              </div>
              {result.points_forts?.length > 0 && (
                <div className="ef-group">
                  <div className="ef-group-title">Points forts</div>
                  {result.points_forts.map((s, i) => (
                    <div key={i} className="ef-row ef-ok"><span className="ef-dot">✓</span><span className="ef-val">{s}</span></div>
                  ))}
                </div>
              )}
              {result.points_faibles?.length > 0 && (
                <div className="ef-group">
                  <div className="ef-group-title">Points à améliorer</div>
                  {result.points_faibles.map((s, i) => (
                    <div key={i} className="ef-row ef-miss"><span className="ef-dot">○</span><span className="ef-val">{s}</span></div>
                  ))}
                </div>
              )}
              {result.suggestions?.length > 0 && (
                <div className="ef-group">
                  <div className="ef-group-title">Suggestions concrètes</div>
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="ef-row" style={{ background: 'rgba(102,103,171,.08)' }}>
                      <span className="ef-dot" style={{ color: 'var(--primary)' }}>→</span>
                      <span className="ef-val">{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.sections_manquantes?.length > 0 && (
                <div className="ef-group">
                  <div className="ef-group-title">Sections manquantes / insuffisantes</div>
                  {result.sections_manquantes.map((s, i) => (
                    <div key={i} className="ef-row ef-miss"><span className="ef-dot">○</span><span className="ef-val">{s}</span></div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setPhase('input'); setResult(null) }}>← Retour</button>
              <button className="btn-export" onClick={onClose}>Fermer</button>
            </div>
          </div>
        )}

        {/* ══════════════ PHASE : RESULT (adapt) ══════════════ */}
        {phase === 'result' && result && mode === 'adapt' && (
          <div className="modal-body">
            <div className="adapt-score-bar">
              <div className="adapt-score-bar-left">
                <span className="adapt-score-big" style={{ color: scoreColor(result.score ?? 0) }}>{result.score ?? '—'}</span>
                <span className="adapt-score-over">/100</span>
                <span className="adapt-score-label-text">Score de correspondance</span>
              </div>
              <div className="adapt-score-track">
                <div className="adapt-score-fill" style={{ width: `${result.score ?? 0}%`, background: scoreColor(result.score ?? 0) }} />
              </div>
            </div>

            <div className="adapt-result-tabs">
              <button className={`adapt-result-tab${resultTab === 'comparaison' ? ' active' : ''}`} onClick={() => setResultTab('comparaison')}>
                Comparaison point par point
                {result.comparaison?.length > 0 && (
                  <span className="adapt-tab-badge">
                    {result.comparaison.filter(c => c.present).length}/{result.comparaison.length}
                  </span>
                )}
              </button>
              <button className={`adapt-result-tab${resultTab === 'modifications' ? ' active' : ''}`} onClick={() => setResultTab('modifications')}>
                Modifications IA
              </button>
            </div>

            {resultTab === 'comparaison' && (
              <div className="ef-list">
                {result.comparaison?.length > 0 ? (
                  <>
                    {result.comparaison.filter(c => c.present).length > 0 && (
                      <div className="ef-group">
                        <div className="ef-group-title">Exigences couvertes</div>
                        {result.comparaison.filter(c => c.present).map((c, i) => (
                          <div key={i} className="ef-row ef-ok">
                            <span className="ef-dot">✓</span>
                            <span className="ef-label" style={{ minWidth: 120 }}>{c.exigence}</span>
                            <span className="ef-val" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.comparaison.filter(c => !c.present).length > 0 && (
                      <div className="ef-group">
                        <div className="ef-group-title">Exigences non couvertes</div>
                        {result.comparaison.filter(c => !c.present).map((c, i) => (
                          <div key={i} className="ef-row ef-miss">
                            <span className="ef-dot">○</span>
                            <span className="ef-label" style={{ minWidth: 120 }}>{c.exigence}</span>
                            <span className="ef-val" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="ef-row ef-miss"><span className="ef-dot">○</span><span className="ef-val">Aucune comparaison — essayez un modèle plus puissant</span></div>
                )}
              </div>
            )}

            {resultTab === 'modifications' && (
              <div className="ef-list">
                <div className="ef-group">
                  <div className="ef-group-title">Modifications apportées</div>
                  {result.resume && <div className="ef-row ef-ok"><span className="ef-dot">✓</span><span className="ef-label">Résumé</span><span className="ef-val">{result.resume.slice(0, 90)}…</span></div>}
                  {result.headline && <div className="ef-row ef-ok"><span className="ef-dot">✓</span><span className="ef-label">Titre</span><span className="ef-val">{result.headline}</span></div>}
                  {result.experiences?.length > 0 && <div className="ef-row ef-ok"><span className="ef-dot">✓</span><span className="ef-label">Expériences</span><span className="ef-val">{result.experiences.length} reformulée{result.experiences.length > 1 ? 's' : ''}</span></div>}
                  {result.competences?.length > 0 && <div className="ef-row ef-ok"><span className="ef-dot">✓</span><span className="ef-label">Compétences</span><span className="ef-val">réorganisées ({result.competences.length})</span></div>}
                </div>
                {result.missing_skills?.length > 0 && (
                  <div className="ef-group">
                    <div className="ef-group-title">Compétences manquantes à acquérir</div>
                    {result.missing_skills.map(s => (
                      <div key={s} className="ef-row ef-miss"><span className="ef-dot">○</span><span className="ef-val">{s}</span></div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-secondary" onClick={onClose}>Garder l'original</button>
              <button className="btn-export" onClick={handleApply}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Appliquer au formulaire
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ PHASE : ERROR ══════════════ */}
        {phase === 'error' && (
          <div className="modal-body">
            <div className="file-dropzone" style={{ cursor: 'default', borderColor: 'rgba(224,92,92,.4)' }}>
              <div className="dropzone-inner">
                <span style={{ fontSize: 28 }}>⚠</span>
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
