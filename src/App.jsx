import { useState } from 'react'
import TabNav from './components/TabNav.jsx'
import PersonalTab from './components/PersonalTab.jsx'
import ExperienceTab from './components/ExperienceTab.jsx'
import EducationTab from './components/EducationTab.jsx'
import SkillsTab from './components/SkillsTab.jsx'
import CVPreview from './components/CVPreview.jsx'

const mkId = () => crypto.randomUUID()

const INIT = {
  personal: {
    prenom: '', nom: '', headline: '', email: '',
    telephone: '', resume: '', photoUrl: null, photoFile: null,
  },
  experiences: [],
  formations: [],
  competences: [],
}

export default function App() {
  const [tab, setTab] = useState('personal')
  const [cv, setCv] = useState(INIT)
  const [exporting, setExporting] = useState(false)

  /* ── personal ── */
  const setPersonal = (field, value) =>
    setCv(p => ({ ...p, personal: { ...p.personal, [field]: value } }))

  /* ── generic list helpers ── */
  const addItem    = (key, tpl)       => setCv(p => ({ ...p, [key]: [...p[key], { id: mkId(), ...tpl }] }))
  const updateItem = (key, id, f, v)  => setCv(p => ({ ...p, [key]: p[key].map(x => x.id === id ? { ...x, [f]: v } : x) }))
  const removeItem = (key, id)        => setCv(p => ({ ...p, [key]: p[key].filter(x => x.id !== id) }))

  /* ── experiences ── */
  const expTpl = { poste: '', entreprise: '', debut: '', fin: '', description: '' }
  const addExp    = () => addItem('experiences', expTpl)
  const updateExp = (id, f, v) => updateItem('experiences', id, f, v)
  const removeExp = id => removeItem('experiences', id)

  /* ── formations ── */
  const formTpl = { diplome: '', ecole: '', debut: '', fin: '', description: '' }
  const addForm    = () => addItem('formations', formTpl)
  const updateForm = (id, f, v) => updateItem('formations', id, f, v)
  const removeForm = id => removeItem('formations', id)

  /* ── compétences ── */
  const compTpl = { nom: '', niveau: '' }
  const addComp    = () => addItem('competences', compTpl)
  const updateComp = (id, f, v) => updateItem('competences', id, f, v)
  const removeComp = id => removeItem('competences', id)

  /* ── export PDF ── */
  const exportPDF = async () => {
    setExporting(true)
    try {
      const fd = new FormData()
      const p = cv.personal
      fd.append('prenom',    p.prenom    || '')
      fd.append('nom',       p.nom       || '')
      fd.append('headline',  p.headline  || '')
      fd.append('email',     p.email     || '')
      fd.append('telephone', p.telephone || '')
      fd.append('resume',    p.resume    || '')

      cv.experiences.forEach(e => {
        fd.append('poste[]',           e.poste       || '')
        fd.append('entreprise[]',      e.entreprise  || '')
        fd.append('debut_exp[]',       e.debut       || '')
        fd.append('fin_exp[]',         e.fin         || '')
        fd.append('description_exp[]', e.description || '')
      })

      cv.formations.forEach(f => {
        fd.append('diplome[]',           f.diplome     || '')
        fd.append('ecole[]',             f.ecole       || '')
        fd.append('debut_form[]',        f.debut       || '')
        fd.append('fin_form[]',          f.fin         || '')
        fd.append('description_form[]',  f.description || '')
      })

      cv.competences.forEach(c => {
        fd.append('competence[]', c.nom    || '')
        fd.append('niveau[]',     c.niveau || '')
      })

      const res = await fetch('export.php', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Erreur serveur')

      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `cv-${p.nom || 'cv'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Impossible de générer le PDF. Vérifiez que le serveur PHP est actif.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">CV</div>
          <span className="brand-name">CV Builder</span>
        </div>
        <button className="btn-export" onClick={exportPDF} disabled={exporting}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {exporting ? 'Génération…' : 'Exporter PDF'}
        </button>
      </header>

      {/* ── Body ── */}
      <main className="app-body">
        {/* Form panel */}
        <section className="form-panel">
          <TabNav active={tab} onChange={setTab} cv={cv} />
          <div className="tab-body">
            {tab === 'personal'    && <PersonalTab    data={cv.personal}     onChange={setPersonal} />}
            {tab === 'experience'  && <ExperienceTab  items={cv.experiences} onAdd={addExp}  onUpdate={updateExp}  onRemove={removeExp}  />}
            {tab === 'education'   && <EducationTab   items={cv.formations}  onAdd={addForm} onUpdate={updateForm} onRemove={removeForm} />}
            {tab === 'skills'      && <SkillsTab      items={cv.competences} onAdd={addComp} onUpdate={updateComp} onRemove={removeComp} />}
          </div>
        </section>

        {/* Preview panel */}
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
