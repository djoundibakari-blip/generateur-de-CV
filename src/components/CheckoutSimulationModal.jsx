import { useState } from 'react'
import { createPortal } from 'react-dom'
import { PLANS } from '../../lib/plans.js'
import { usePlan } from '../context/PlanContext.jsx'

export default function CheckoutSimulationModal({ planKey, onClose }) {
  const { refresh } = usePlan()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const plan = PLANS[planKey]

  const confirm = async () => {
    setLoading(true)
    await fetch('/api/dev-select-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey }),
    })
    await refresh()
    setLoading(false)
    setDone(true)
  }

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card auth-prompt-card">
        <div className="modal-body auth-prompt-body">
          {!done ? (
            <>
              <span className="auth-prompt-icon">💳</span>
              <h2 className="auth-prompt-title">Simulation de paiement</h2>
              <p className="auth-prompt-desc">
                Aucun paiement réel n'est effectué (phase de test — Stripe n'est pas encore branché).
                Confirmez pour passer au plan <strong>{plan.name}</strong> ({(plan.priceMonthly / 100).toFixed(0)}€/mois,
                {' '}{plan.monthlyCredits} crédits IA) et débloquer ses fonctionnalités immédiatement.
              </p>
              <div className="auth-prompt-actions">
                <button className="auth-prompt-btn-primary" onClick={confirm} disabled={loading}>
                  {loading ? 'Activation…' : `Confirmer le plan ${plan.name}`}
                </button>
                <button className="auth-prompt-btn-secondary" onClick={onClose}>Annuler</button>
              </div>
            </>
          ) : (
            <>
              <span className="auth-prompt-icon">✅</span>
              <h2 className="auth-prompt-title">Plan {plan.name} activé</h2>
              <p className="auth-prompt-desc">
                Simulation réussie — votre compte a maintenant accès aux fonctionnalités du plan {plan.name}.
              </p>
              <div className="auth-prompt-actions">
                <button className="auth-prompt-btn-primary" onClick={onClose}>Fermer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
