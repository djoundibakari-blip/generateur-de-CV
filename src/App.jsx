import { useState } from 'react'
import LandingPage from './components/LandingPage.jsx'
import TabNav from './components/TabNav.jsx'
import PersonalTab from './components/PersonalTab.jsx'
import ExperienceTab from './components/ExperienceTab.jsx'
import ProjectsTab from './components/ProjectsTab.jsx'
import EducationTab from './components/EducationTab.jsx'
import SkillsTab from './components/SkillsTab.jsx'
import CVPreview from './components/CVPreview.jsx'
import ImportModal from './components/ImportModal.jsx'
import AdaptModal from './components/AdaptModal.jsx'
import AccountMenu from './components/AccountMenu.jsx'
import AuthPrompt from './components/AuthPrompt.jsx'
import LoginModal from './components/LoginModal.jsx'
import { usePlan } from './context/PlanContext.jsx'
import { FEATURES } from '../lib/plans.js'

const AUTH_PROMPT_KEY = 'cv_auth_prompt_dismissed'

const mkId = () => crypto.randomUUID()

const INIT = {
  personal: {
    prenom: '', nom: '', headline: '', email: '',
    telephone: '', resume: '', localisation: '', github: '',
    photoUrl: null, photoFile: null,
  },
  experiences: [],
  projets: [],
  formations: [],
  competences: [],
  qualites: [],
  langues: [],
  passions: [],
}

export default function App() {
  const { loading: planLoading, authenticated, can } = usePlan()

  const [tab, setTab] = useState('personal')
  const [cv, setCv] = useState(INIT)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [adapting, setAdapting]   = useState(false)
  const [prevCv, setPrevCv]       = useState(null)
  const [loginPrompt, setLoginPrompt] = useState(false)

  const [started, setStarted] = useState(false)

  const [authPromptDismissed, setAuthPromptDismissed] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(AUTH_PROMPT_KEY) === '1'
  )
  const dismissAuthPrompt = () => {
    sessionStorage.setItem(AUTH_PROMPT_KEY, '1')
    setAuthPromptDismissed(true)
  }

  const canImport = can(FEATURES.IMPORT_CV)
  const canAdapt  = can(FEATURES.AI_ADAPT)

  const handleImportClick = () => {
    if (!canImport) { setLoginPrompt(true); return }
    setImporting(true)
  }
  const handleAdaptClick = () => {
    if (!canAdapt) { setLoginPrompt(true); return }
    setAdapting(true)
  }

  const handleImport = (parsed) => { setCv(parsed); setTab('personal') }

  const handleAdapt = (aiResult) => {
    setPrevCv(cv)
    setCv(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        // N'écrase que si l'IA a fourni une valeur non vide
        ...(aiResult.resume   ? { resume:   aiResult.resume   } : {}),
        ...(aiResult.headline ? { headline: aiResult.headline } : {}),
      },
      experiences: prev.experiences.map(exp => {
        const adapted = (aiResult.experiences || []).find(e => e.id === exp.id)
        return adapted?.description ? { ...exp, description: adapted.description } : exp
      }),
      competences: (() => {
        if (!aiResult.competences?.length) return prev.competences
        return aiResult.competences.map(c => {
          const orig = prev.competences.find(o => o.id === c.id)
          if (orig) return { ...orig, nom: c.nom || orig.nom, niveau: c.niveau || orig.niveau }
          // Compétence nouvelle (pas dans le CV d'origine) → crée avec un vrai ID
          return { id: mkId(), nom: c.nom || '', niveau: c.niveau || '' }
        }).filter(c => c.nom)
      })(),
    }))
  }

  /* personal */
  const setPersonal = (field, value) =>
    setCv(p => ({ ...p, personal: { ...p.personal, [field]: value } }))

  /* generic helpers */
  const addItem    = (key, tpl)      => setCv(p => ({ ...p, [key]: [...p[key], { id: mkId(), ...tpl }] }))
  const updateItem = (key, id, f, v) => setCv(p => ({ ...p, [key]: p[key].map(x => x.id === id ? { ...x, [f]: v } : x) }))
  const removeItem   = (key, id)       => setCv(p => ({ ...p, [key]: p[key].filter(x => x.id !== id) }))
  const reorderItem  = (key, fromId, toId) => setCv(p => {
    const arr = [...p[key]]
    const fi  = arr.findIndex(x => x.id === fromId)
    const ti  = arr.findIndex(x => x.id === toId)
    if (fi < 0 || ti < 0 || fi === ti) return p
    const [moved] = arr.splice(fi, 1)
    arr.splice(ti, 0, moved)
    return { ...p, [key]: arr }
  })

  /* experiences */
  const expTpl = { poste: '', entreprise: '', debut: '', fin: '', description: '' }
  const addExp    = () => addItem('experiences', expTpl)
  const updateExp = (id, f, v) => updateItem('experiences', id, f, v)
  const removeExp = id => removeItem('experiences', id)

  /* projets */
  const projetTpl = { nom: '', technologies: '', lien: '', description: '' }
  const addProjet    = () => addItem('projets', projetTpl)
  const updateProjet = (id, f, v) => updateItem('projets', id, f, v)
  const removeProjet = id => removeItem('projets', id)

  /* formations */
  const formTpl = { diplome: '', ecole: '', debut: '', fin: '', description: '' }
  const addForm    = () => addItem('formations', formTpl)
  const updateForm = (id, f, v) => updateItem('formations', id, f, v)
  const removeForm = id => removeItem('formations', id)

  /* compétences */
  const compTpl = { nom: '', niveau: '' }
  const addComp    = () => addItem('competences', compTpl)
  const updateComp = (id, f, v) => updateItem('competences', id, f, v)
  const removeComp = id => removeItem('competences', id)

  /* qualités */
  const qualTpl = { nom: '' }
  const addQual    = () => addItem('qualites', qualTpl)
  const updateQual = (id, f, v) => updateItem('qualites', id, f, v)
  const removeQual = id => removeItem('qualites', id)

  /* langues */
  const langTpl = { nom: '', niveau: '' }
  const addLang    = () => addItem('langues', langTpl)
  const updateLang = (id, f, v) => updateItem('langues', id, f, v)
  const removeLang = id => removeItem('langues', id)

  /* passions */
  const passTpl = { nom: '' }
  const addPass    = () => addItem('passions', passTpl)
  const updatePass = (id, f, v) => updateItem('passions', id, f, v)
  const removePass = id => removeItem('passions', id)

  /* export PDF */
  const exportPDF = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cv),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `cv-${cv.personal.nom || 'cv'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Impossible de générer le PDF.')
    } finally {
      setExporting(false)
    }
  }

  const authPrompt = !planLoading && !authenticated && !authPromptDismissed && (
    <AuthPrompt onDismiss={dismissAuthPrompt} />
  )

  if (!started) {
    return (
      <>
        <LandingPage onStart={() => setStarted(true)} />
        {authPrompt}
      </>
    )
  }

  return (
    <div className="app">
      {authPrompt}

      {loginPrompt && <LoginModal onClose={() => setLoginPrompt(false)} />}

      {importing && (
        <ImportModal
          onClose={() => setImporting(false)}
          onApply={handleImport}
        />
      )}

      {adapting && (
        <AdaptModal
          cv={cv}
          onApply={handleAdapt}
          onClose={() => setAdapting(false)}
        />
      )}

      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">CV</div>
          <span className="brand-name">CV Builder</span>
        </div>
        <div className="header-actions">
          <button className={`btn-import${canImport ? '' : ' btn-locked'}`} onClick={handleImportClick}>
            {canImport ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            ) : '🔒'}
            Importer un CV
          </button>
          <button className={`btn-adapt${canAdapt ? '' : ' btn-locked'}`} onClick={handleAdaptClick}>
            {canAdapt ? '✨' : '🔒'} Adapter au poste
          </button>
          {prevCv && (
            <button className="btn-undo" onClick={() => { setCv(prevCv); setPrevCv(null) }} title="Annuler l'adaptation IA">
              ↩ Annuler l'IA
            </button>
          )}
          <button className="btn-export" onClick={exportPDF} disabled={exporting}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 14 12 9 7 14"/><line x1="12" y1="9" x2="12" y2="21"/>
            </svg>
            {exporting ? 'Génération…' : 'Exporter PDF'}
          </button>
          <AccountMenu />
        </div>
      </header>

      <main className="app-body">
        <section className="form-panel">
          <TabNav active={tab} onChange={setTab} cv={cv} />
          <div className="tab-body">
            {tab === 'personal'   && <PersonalTab   data={cv.personal}     onChange={setPersonal} />}
            {tab === 'experience' && <ExperienceTab items={cv.experiences} onAdd={addExp}    onUpdate={updateExp}    onRemove={removeExp}    onReorder={(f,t) => reorderItem('experiences', f, t)} />}
            {tab === 'projects'   && <ProjectsTab    items={cv.projets}     onAdd={addProjet} onUpdate={updateProjet} onRemove={removeProjet} onReorder={(f,t) => reorderItem('projets',     f, t)} />}
            {tab === 'education'  && <EducationTab  items={cv.formations}  onAdd={addForm} onUpdate={updateForm} onRemove={removeForm} onReorder={(f,t) => reorderItem('formations',  f, t)} />}
            {tab === 'skills'     && (
              <SkillsTab
                items={cv.competences}  onAdd={addComp} onUpdate={updateComp} onRemove={removeComp}
                qualites={cv.qualites}  onAddQual={addQual}  onUpdateQual={updateQual}  onRemoveQual={removeQual}
                langues={cv.langues}    onAddLang={addLang}  onUpdateLang={updateLang}  onRemoveLang={removeLang}
                passions={cv.passions}  onAddPass={addPass}  onUpdatePass={updatePass}  onRemovePass={removePass}
              />
            )}
          </div>
        </section>

        <section className="preview-panel">
          <p className="preview-label">Aperçu en temps réel</p>
          <div className="preview-sticky">
            <CVPreview cv={cv} />
          </div>
        </section>
      </main>
    </div>
  )
}
