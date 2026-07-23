export default function LandingPage({ onStart }) {
  return (
    <div className="lp">

      {/* ── Nav ── */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">
          <span className="lp-logo">CV</span>
          <span className="lp-logo-text">Builder</span>
        </div>
        <ul className="lp-nav-links">
          <li><a href="#fonctionnement">Fonctionnement</a></li>
          <li><a href="#features">Fonctionnalités</a></li>
          <li>
            <button className="lp-nav-cta" onClick={onStart}>Commencer</button>
          </li>
        </ul>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        {/* Background blobs */}
        <div className="lp-blob lp-blob-1" aria-hidden="true" />
        <div className="lp-blob lp-blob-2" aria-hidden="true" />

        <div className="lp-hero-content">
          <p className="lp-hero-eyebrow">Générateur de CV professionnel</p>
          <h1 className="lp-hero-title">
            <span className="lp-title-line">Votre CV,</span>
            <span className="lp-title-line lp-title-accent">Réinventé.</span>
          </h1>
          <p className="lp-hero-desc">
            Importez votre CV, adaptez-le à une offre d'emploi grâce à l'IA locale Ollama,
            et obtenez un CV élégant prêt à envoyer en quelques secondes.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary" onClick={onStart}>
              Créer mon CV
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <a href="#fonctionnement" className="lp-btn-ghost">Voir comment ça marche</a>
          </div>

          {/* Stats */}
          <div className="lp-stats">
            <div className="lp-stat"><span className="lp-stat-num">PDF</span><span className="lp-stat-label">Export haute qualité</span></div>
            <div className="lp-stat-sep" />
            <div className="lp-stat"><span className="lp-stat-num">OCR</span><span className="lp-stat-label">Lecture automatique</span></div>
            <div className="lp-stat-sep" />
            <div className="lp-stat"><span className="lp-stat-num">100%</span><span className="lp-stat-label">Gratuit & local</span></div>
          </div>
        </div>

        {/* CV mockup */}
        <div className="lp-hero-visual" aria-hidden="true">
          <div className="lp-cv-mock">
            <div className="lp-mock-header">
              <div className="lp-mock-avatar" />
              <div className="lp-mock-lines">
                <div className="lp-mock-line lp-mock-line--wide" />
                <div className="lp-mock-line lp-mock-line--med" />
              </div>
            </div>
            <div className="lp-mock-sidebar">
              <div className="lp-mock-section">
                <div className="lp-mock-label" />
                <div className="lp-mock-line" /><div className="lp-mock-line lp-mock-line--sm" />
                <div className="lp-mock-line lp-mock-line--med" />
              </div>
              <div className="lp-mock-section">
                <div className="lp-mock-label" />
                <div className="lp-mock-line lp-mock-line--sm" />
                <div className="lp-mock-line" />
                <div className="lp-mock-line lp-mock-line--sm" />
                <div className="lp-mock-line lp-mock-line--med" />
              </div>
            </div>
            <div className="lp-mock-main">
              <div className="lp-mock-section">
                <div className="lp-mock-label lp-mock-label--dark" />
                <div className="lp-mock-rule" />
                <div className="lp-mock-line lp-mock-line--full" />
                <div className="lp-mock-line lp-mock-line--full" />
                <div className="lp-mock-line lp-mock-line--med" />
              </div>
              <div className="lp-mock-section">
                <div className="lp-mock-label lp-mock-label--dark" />
                <div className="lp-mock-rule" />
                <div className="lp-mock-entry">
                  <div className="lp-mock-line lp-mock-line--wide" />
                  <div className="lp-mock-line lp-mock-line--sm" />
                </div>
                <div className="lp-mock-entry">
                  <div className="lp-mock-line lp-mock-line--med" />
                  <div className="lp-mock-line lp-mock-line--sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side dots */}
        <div className="lp-side-dots" aria-hidden="true">
          {[0,1,2,3,4].map(i => <span key={i} className={`lp-dot${i === 2 ? ' lp-dot--active' : ''}`} />)}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-section" id="fonctionnement">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow">Simple &amp; Rapide</p>
          <h2 className="lp-section-title">Comment ça marche ?</h2>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">01</div>
              <div className="lp-step-icon">📂</div>
              <h3>Importez votre CV</h3>
              <p>Glissez un fichier PDF, DOCX, PNG ou TXT. L'OCR extrait automatiquement toutes vos informations.</p>
            </div>
            <div className="lp-step-arrow">→</div>
            <div className="lp-step">
              <div className="lp-step-num">02</div>
              <div className="lp-step-icon">✏️</div>
              <h3>Personnalisez</h3>
              <p>Vérifiez et ajustez vos informations dans le formulaire. L'aperçu se met à jour en temps réel.</p>
            </div>
            <div className="lp-step-arrow">→</div>
            <div className="lp-step">
              <div className="lp-step-num">03</div>
              <div className="lp-step-icon">✨</div>
              <h3>Adaptez avec l'IA</h3>
              <p>Collez une offre d'emploi — l'IA locale (Ollama) optimise votre résumé, compétences et expériences pour le poste visé.</p>
            </div>
            <div className="lp-step-arrow">→</div>
            <div className="lp-step">
              <div className="lp-step-num">04</div>
              <div className="lp-step-icon">📄</div>
              <h3>Exportez en PDF</h3>
              <p>Téléchargez votre CV au format PDF, prêt à envoyer à vos recruteurs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-section lp-section--dark" id="features">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow">Fonctionnalités</p>
          <h2 className="lp-section-title">Tout ce dont vous avez besoin</h2>
          <div className="lp-features">
            {[
              { icon: '🤖', title: 'Extraction intelligente', desc: 'Parser regex + OCR Tesseract pour lire PDF, Word, images et texte brut.' },
              { icon: '🎨', title: 'Template élégant', desc: 'Design professionnel dark navy avec palette Moon — sidebar, header, sections colorées.' },
              { icon: '📥', title: 'Export PDF fidèle', desc: 'Génération serveur via Dompdf pour une mise en page parfaite, pixel perfect.' },
              { icon: '⚡', title: 'Aperçu temps réel', desc: 'Chaque frappe met à jour le CV instantanément — pas besoin de recharger.' },
              { icon: '🌍', title: 'Multilingue', desc: 'Détecte les CV en français et en anglais, adapte les sections automatiquement.' },
              { icon: '🤖', title: 'IA locale Ollama', desc: 'Adaptez votre CV à chaque offre d\'emploi en un clic. Score de matching, compétences manquantes, reformulation des expériences.' },
              { icon: '🔒', title: '100% local', desc: 'Aucune donnée envoyée en ligne. L\'IA tourne sur votre machine avec Ollama.' },
            ].map(f => (
              <div key={f.title} className="lp-feature-card">
                <span className="lp-feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-cta-section">
        <div className="lp-blob lp-blob-3" aria-hidden="true" />
        <h2 className="lp-cta-title">Prêt à créer votre CV ?</h2>
        <p className="lp-cta-sub">Aucune inscription requise. Commencez maintenant.</p>
        <button className="lp-btn-primary lp-btn-large" onClick={onStart}>
          Commencer gratuitement
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <span className="lp-logo">CV</span>
          <span className="lp-logo-text">Builder</span>
        </div>
        <p className="lp-footer-copy">© 2025 — Tous droits réservés</p>
      </footer>

    </div>
  )
}
