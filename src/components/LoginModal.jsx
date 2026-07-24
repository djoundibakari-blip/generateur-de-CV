import { useState } from 'react'
import { createPortal } from 'react-dom'
import { signIn } from 'next-auth/react'
import { usePlan } from '../context/PlanContext.jsx'

// Comptes de démo (phase de test uniquement — voir memoire projet_test_accounts)
const TEST_ACCOUNTS = [
  { email: 'test@generateur-cv.test', label: 'Gratuit' },
  { email: 'admin@generateur-cv.test', label: 'Premium' },
]
const TEST_PASSWORD = 'cvtest-594dacf4'

export default function LoginModal({ onClose }) {
  const { refresh } = usePlan()
  const [showTestForm, setShowTestForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = () => signIn('google')

  const handleTestLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('dev-login', { redirect: false, email, password })
    setLoading(false)
    if (result?.error) { setError('Email ou mot de passe incorrect.'); return }
    await refresh()
    onClose()
  }

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card login-modal-card">

        <div className="modal-head">
          <div className="modal-head-left">
            <span className="modal-icon">🔐</span>
            <div>
              <div className="modal-title">Se connecter</div>
              <div className="modal-sub">Accédez aux fonctionnalités IA selon votre offre</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <button className="btn-google" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-2.98c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.31 14.34c-.24-.72-.38-1.49-.38-2.34s.14-1.62.38-2.34V6.57H1.3A11.98 11.98 0 000 12c0 1.93.46 3.76 1.3 5.43l4.01-3.09z"/>
              <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.57l4.01 3.09c.94-2.82 3.58-4.91 6.69-4.91z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="modal-divider"><span>ou</span></div>

          {!showTestForm ? (
            <button className="btn-secondary login-test-toggle" onClick={() => setShowTestForm(true)}>
              Compte de test (email / mot de passe)
            </button>
          ) : (
            <>
              <div className="login-demo-hint">
                <p className="login-demo-hint-title">Comptes de démonstration (phase de test)</p>
                {TEST_ACCOUNTS.map(acc => (
                  <button
                    type="button" key={acc.email} className="login-demo-account"
                    onClick={() => { setEmail(acc.email); setPassword(TEST_PASSWORD) }}
                  >
                    <span className="login-demo-email">{acc.email}</span>
                    <span className="login-demo-plan">{acc.label}</span>
                  </button>
                ))}
                <p className="login-demo-password">Mot de passe : <code>{TEST_PASSWORD}</code></p>
              </div>

              <form onSubmit={handleTestLogin}>
                <div className="field">
                  <label className="field-label">Email</label>
                  <input
                    className="field-input" type="email" required autoFocus
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="test@generateur-cv.test"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Mot de passe</label>
                  <input
                    className="field-input" type="password" required
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="login-error">{error}</p>}
                <button className="btn-export login-submit" type="submit" disabled={loading}>
                  {loading ? 'Connexion…' : 'Se connecter'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
