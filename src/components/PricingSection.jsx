import { useState } from 'react'
import { PLANS, PLAN_ORDER, FEATURE_LABELS, FEATURE_DISPLAY_ORDER } from '../../lib/plans.js'
import { usePlan } from '../context/PlanContext.jsx'
import LoginModal from './LoginModal.jsx'
import CheckoutSimulationModal from './CheckoutSimulationModal.jsx'

const RECOMMENDED_PLAN = 'INTERMEDIATE'

function formatPrice(cents) {
  if (cents === 0) return '0€'
  return `${(cents / 100).toFixed(0)}€`
}

export default function PricingSection({ onStart }) {
  const { authenticated, plan: currentPlan } = usePlan()
  const [showLogin, setShowLogin] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState(null)

  const handleChoosePlan = (key) => {
    if (!authenticated) { setShowLogin(true); return }
    setCheckoutPlan(key)
  }

  return (
    <section className="lp-section" id="tarifs">
      <div className="lp-section-inner">
        <div className="lp-left-head">
          <span className="lp-eyebrow">Tarifs</span>
          <h2 className="lp-left-title">Une offre <span className="lp-dim">pour chaque besoin.</span></h2>
        </div>

        <div className="pricing-grid">
          {PLAN_ORDER.map(key => {
            const plan = PLANS[key]
            const recommended = key === RECOMMENDED_PLAN
            const isCurrent = authenticated && currentPlan === key
            return (
              <div key={key} className={`pricing-card${recommended ? ' pricing-card--highlight' : ''}`}>
                {recommended && !isCurrent && <span className="pricing-badge">Le plus populaire</span>}
                {isCurrent && <span className="pricing-badge pricing-badge--current">Votre offre actuelle</span>}
                <h3 className="pricing-name">{plan.name}</h3>
                <p className="pricing-tagline">{plan.tagline}</p>
                <div className="pricing-price">
                  <span className="pricing-price-num">{formatPrice(plan.priceMonthly)}</span>
                  <span className="pricing-price-period">/mois</span>
                </div>
                <p className="pricing-credits">
                  {plan.monthlyCredits > 0 ? `${plan.monthlyCredits} crédits IA / mois` : 'Sans IA'}
                </p>

                <ul className="pricing-features">
                  {FEATURE_DISPLAY_ORDER.map(feature => {
                    const included = plan.features.includes(feature)
                    return (
                      <li key={feature} className={included ? 'pricing-feat-yes' : 'pricing-feat-no'}>
                        <span className="pricing-feat-icon">{included ? '✓' : '—'}</span>
                        {FEATURE_LABELS[feature]}
                      </li>
                    )
                  })}
                </ul>

                {key === 'FREE' ? (
                  <button className="pricing-cta pricing-cta--free" onClick={onStart}>Commencer gratuitement</button>
                ) : isCurrent ? (
                  <button className="pricing-cta" disabled>Offre actuelle</button>
                ) : (
                  <button className="pricing-cta pricing-cta--free" onClick={() => handleChoosePlan(key)}>
                    Choisir cette offre
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {checkoutPlan && (
        <CheckoutSimulationModal planKey={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
      )}
    </section>
  )
}
