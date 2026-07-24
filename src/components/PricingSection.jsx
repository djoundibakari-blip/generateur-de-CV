import { PLANS, PLAN_ORDER, FEATURE_LABELS, FEATURE_DISPLAY_ORDER } from '../../lib/plans.js'

const RECOMMENDED_PLAN = 'INTERMEDIATE'

function formatPrice(cents) {
  if (cents === 0) return '0€'
  return `${(cents / 100).toFixed(0)}€`
}

export default function PricingSection({ onStart }) {
  return (
    <section className="lp-section" id="tarifs">
      <div className="lp-section-inner">
        <p className="lp-section-eyebrow">Tarifs</p>
        <h2 className="lp-section-title">Une offre pour chaque besoin</h2>

        <div className="pricing-grid">
          {PLAN_ORDER.map(key => {
            const plan = PLANS[key]
            const recommended = key === RECOMMENDED_PLAN
            return (
              <div key={key} className={`pricing-card${recommended ? ' pricing-card--highlight' : ''}`}>
                {recommended && <span className="pricing-badge">Le plus populaire</span>}
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
                ) : (
                  <button className="pricing-cta" disabled title="Paiement en cours de mise en place">
                    Bientôt disponible
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
