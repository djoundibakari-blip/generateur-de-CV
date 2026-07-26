import { useEffect, useState } from 'react'
import AccountMenu from './AccountMenu.jsx'
import PricingSection from './PricingSection.jsx'

const FEATURES = [
  { num: '01', title: 'Extraction intelligente', desc: 'Parser regex + OCR pour lire vos CV existants au format PDF, Word, image ou texte brut.' },
  { num: '02', title: 'Adaptation par IA', desc: "Adaptez votre CV à chaque offre en un clic : score de correspondance, compétences manquantes, reformulation." },
  { num: '03', title: 'Lettre de motivation', desc: "Générée à partir de votre CV et de l'offre visée, prête à personnaliser (offre Premium)." },
  { num: '04', title: 'Export PDF fidèle', desc: 'Génération serveur pour une mise en page parfaite, pixel perfect, prête à envoyer.' },
  { num: '05', title: 'Aperçu temps réel', desc: "Chaque frappe met à jour le CV instantanément, sans avoir à recharger la page." },
  { num: '06', title: 'Multilingue', desc: 'Détecte les CV en français et en anglais, et adapte les sections automatiquement.' },
]

const STEPS = [
  { num: '01', title: 'Importez votre CV', desc: "Glissez un fichier PDF, DOCX, PNG ou TXT : l'OCR extrait automatiquement toutes vos informations." },
  { num: '02', title: 'Personnalisez-le', desc: "Vérifiez et ajustez vos informations dans le formulaire, l'aperçu se met à jour en temps réel." },
  { num: '03', title: "Adaptez-le à l'offre", desc: "Collez une offre d'emploi : l'IA optimise votre résumé, vos compétences et vos expériences pour le poste visé." },
  { num: '04', title: 'Exportez en PDF', desc: 'Téléchargez votre CV au format PDF, prêt à envoyer à vos recruteurs.' },
]

export default function LandingPage({ onStart }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="lp">

      {/* ── Nav ── */}
      <nav className={`lp-nav${scrolled ? ' lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-brand">
            <span className="lp-brand-box">CV</span>
            <span className="lp-brand-word">CV BUILDER</span>
          </div>
          <ul className="lp-nav-links">
            <li><a href="#fonctionnement">Fonctionnement</a></li>
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#tarifs">Tarifs</a></li>
          </ul>
          <div className="lp-nav-actions">
            <AccountMenu />
            <button className="lp-btn lp-btn-solid" onClick={onStart}>Commencer</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-inner">
          <span className="lp-eyebrow"><span className="lp-live-dot"></span>Générateur de CV &amp; lettres · IA active</span>
          <h1 className="lp-hero-title lp-stack">
            <span className="lp-l lp-l-solid">Votre CV,</span>
            <span className="lp-l lp-l-outline">adapté en</span>
            <span className="lp-l lp-l-gradient">quelques clics.</span>
          </h1>
          <p className="lp-hero-sub">
            Créez votre CV gratuitement, ou laissez l'IA l'adapter à une offre d'emploi
            et générer votre lettre de motivation en quelques secondes.
          </p>
          <div className="lp-hero-cta">
            <button className="lp-btn lp-btn-solid lp-btn-lg" onClick={onStart}>Créer mon CV →</button>
            <a className="lp-btn lp-btn-outline lp-btn-lg" href="#fonctionnement">Voir comment ça marche</a>
          </div>
        </div>
        <div className="lp-scroll-cue"><div className="lp-scroll-mouse"><i></i></div><span>Scroll</span></div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="lp-section" id="fonctionnement">
        <div className="lp-section-inner">
          <div className="lp-left-head">
            <span className="lp-eyebrow">Comment ça marche ?</span>
            <h2 className="lp-left-title">De votre CV brut <span className="lp-dim">au document prêt à envoyer.</span></h2>
          </div>
          <ol className="lp-workflow-list">
            {STEPS.map(s => (
              <li className="lp-workflow-row" key={s.num}>
                <span className="lp-workflow-num">{s.num}</span>
                <div><h3>{s.title}</h3><p>{s.desc}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-split-head">
            <span className="lp-eyebrow">Fonctionnalités</span>
            <h2 className="lp-split-title">Tout ce qu'il faut <span className="lp-dim">pour candidater vite.</span></h2>
          </div>
          <div className="lp-feature-grid">
            {FEATURES.map(f => (
              <article className="lp-feature" key={f.num}>
                <span className="lp-feature-num">{f.num}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PricingSection onStart={onStart} />

      {/* ── CTA finale ── */}
      <section className="lp-cta-final">
        <div className="lp-section-inner">
          <div className="lp-cta-grid">
            <div>
              <span className="lp-eyebrow">Commencer</span>
              <h2 className="lp-cta-title lp-stack">
                <span className="lp-l lp-l-solid">Prêt à créer</span>
                <span className="lp-l lp-l-outline">votre prochain</span>
                <span className="lp-l lp-l-gradient">CV ?</span>
              </h2>
              <p className="lp-cta-sub">Le mode manuel est gratuit et sans inscription. Passez à l'IA quand vous êtes prêt.</p>
            </div>
            <button className="lp-btn lp-btn-solid lp-btn-lg" onClick={onStart}>Commencer maintenant →</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-brand">
            <span className="lp-brand-box">CV</span>
            <span className="lp-brand-word">CV BUILDER</span>
          </div>
          <span className="lp-footer-caption">Export PDF · IA Groq · Fait avec Next.js</span>
        </div>
      </footer>

    </div>
  )
}
