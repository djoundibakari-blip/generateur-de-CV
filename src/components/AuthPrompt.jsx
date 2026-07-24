import { useState } from 'react'
import { createPortal } from 'react-dom'
import LoginModal from './LoginModal.jsx'

export default function AuthPrompt({ onDismiss }) {
  const [showLogin, setShowLogin] = useState(false)

  if (showLogin) {
    return <LoginModal onClose={() => { setShowLogin(false); onDismiss() }} />
  }

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-card auth-prompt-card">
        <div className="modal-body auth-prompt-body">
          <span className="auth-prompt-icon">✨</span>
          <h2 className="auth-prompt-title">Bienvenue sur CV Builder</h2>
          <p className="auth-prompt-desc">
            Connectez-vous pour débloquer l'import de CV par IA, l'adaptation au poste
            et la lettre de motivation. Sans connexion, seule la création manuelle du CV
            (offre Gratuite) est disponible.
          </p>
          <div className="auth-prompt-actions">
            <button className="auth-prompt-btn-primary" onClick={() => setShowLogin(true)}>Se connecter</button>
            <button className="auth-prompt-btn-secondary" onClick={onDismiss}>Continuer en gratuit</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
