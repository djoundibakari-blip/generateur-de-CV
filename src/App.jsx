import { useState } from 'react'
import TabNav from './components/TabNav.jsx'
import PersonalTab from './components/PersonalTab.jsx'
import ExperienceTab from './components/ExperienceTab.jsx'
import EducationTab from './components/EducationTab.jsx'
import SkillsTab from './components/SkillsTab.jsx'
import CVPreview from './components/CVPreview.jsx'
import ImportModal from './components/ImportModal.jsx'

const mkId = () => crypto.randomUUID()

const INIT = {
  personal: {
    prenom: '', nom: '', headline: '', email: '',
    telephone: '', resume: '', localisation: '', github: '',
    photoUrl: null, photoFile: null,
  },
  experiences: [],
  formations: [],
  competences: [],
  qualites: [],
  langues: [],
  passions: [],
}

export default function App() {
  const [tab, setTab] = useState('personal')
  const [cv, setCv] = useState(INIT)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleImport = (parsed) => { setCv(parsed); setTab('personal') }

  /* personal */
  const setPersonal = (field, value) =>
    setCv(p => ({ ...p, personal: { ...p.personal, [field]: value } }))

  /* generic helpers */
  const addItem    = (key, tpl)      => setCv(p => ({ ...p, [key]: [...p[key], { id: mkId(), ...tpl }] }))
  const updateItem = (key, id, f, v) => setCv(p => ({ ...p, [key]: p[key].map(x => x.id === id ? { ...x, [f]: v } : x) }))
  const removeItem = (key, id)       => setCv(p => ({ ...p, [key]: p[key].filter(x => x.id !== id) }))

  /* experiences */
  const expTpl = { poste: '', entreprise: '', debut: '', fin: '', description: '' }
  const addExp    = () => addItem('experiences', expTpl)
  const updateExp = (id, f, v) => updateItem('experiences', id, f, v)
  const removeExp = id => removeItem('experiences', id)

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
      const fd = new FormData()
      const p = cv.personal
      fd.append('prenom',       p.prenom       || '')
      fd.append('nom',          p.nom          || '')
      fd.append('headline',     p.headline     || '')
      fd.append('email',        p.email        || '')
      fd.append('telephone',    p.telephone    || '')
      fd.append('resume',       p.resume       || '')
      fd.append('localisation', p.localisation || '')
      fd.append('github',       p.github       || '')

      cv.experiences.forEach(e => {
        fd.append('poste[]',           e.poste       || '')
        fd.append('entreprise[]',      e.entreprise  || '')
        fd.append('debut_exp[]',       e.debut       || '')
        fd.append('fin_exp[]',         e.fin         || '')
        fd.append('description_exp[]', e.description || '')
      })

      cv.formations.forEach(f => {
        fd.append('diplome[]',          f.diplome     || '')
        fd.append('ecole[]',            f.ecole       || '')
        fd.append('debut_form[]',       f.debut       || '')
        fd.append('fin_form[]',         f.fin         || '')
        fd.append('description_form[]', f.description || '')
      })

      cv.competences.forEach(c => {
        fd.append('competence[]', c.nom    || '')
        fd.append('niveau[]',     c.niveau || '')
      })

      cv.qualites.forEach(q => fd.append('qualite[]', q.nom || ''))

      cv.langues.forEach(l => {
        fd.append('langue[]',        l.nom    || '')
        fd.append('langue_niveau[]', l.niveau || '')
      })

      cv.passions.forEach(p2 => fd.append('passion[]', p2.nom || ''))

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
      {importing && (
        <ImportModal
          onClose={() => setImporting(false)}
          onApply={handleImport}
        />
      )}

      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">CV</div>
          <span className="brand-name">CV Builder</span>
        </div>
        <div className="header-actions">
          <button className="btn-import" onClick={() => setImporting(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Importer un CV
          </button>
          <button className="btn-export" onClick={exportPDF} disabled={exporting}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 14 12 9 7 14"/><line x1="12" y1="9" x2="12" y2="21"/>
            </svg>
            {exporting ? 'Génération…' : 'Exporter PDF'}
          </button>
        </div>
      </header>

      <main className="app-body">
        <section className="form-panel">
          <TabNav active={tab} onChange={setTab} cv={cv} />
          <div className="tab-body">
            {tab === 'personal'   && <PersonalTab   data={cv.personal}     onChange={setPersonal} />}
            {tab === 'experience' && <ExperienceTab items={cv.experiences} onAdd={addExp}  onUpdate={updateExp}  onRemove={removeExp}  />}
            {tab === 'education'  && <EducationTab  items={cv.formations}  onAdd={addForm} onUpdate={updateForm} onRemove={removeForm} />}
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
