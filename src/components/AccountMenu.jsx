import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { usePlan } from '../context/PlanContext.jsx'
import { PLANS } from '../../lib/plans.js'
import LoginModal from './LoginModal.jsx'

export default function AccountMenu() {
  const { loading, authenticated, user, plan, creditsBalance, refresh } = usePlan()
  const [showLogin, setShowLogin] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    await refresh()
  }

  if (loading) return null

  if (!authenticated) {
    return (
      <>
        <button className="account-btn-login" onClick={() => setShowLogin(true)}>Se connecter</button>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </>
    )
  }

  return (
    <div className="account-menu">
      <span className={`account-plan-badge account-plan-badge--${plan.toLowerCase()}`}>
        {PLANS[plan]?.name ?? plan}
      </span>
      <span className="account-user-name">{user?.name || user?.email}</span>
      {plan !== 'FREE' && <span className="account-credits">{creditsBalance} crédits</span>}
      <button className="account-btn-logout" onClick={handleLogout}>Se déconnecter</button>
    </div>
  )
}
