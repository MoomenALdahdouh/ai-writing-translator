import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import './Privacy.css'

export default function Account() {
  return (
    <>
      <SEO 
        title="Lingo Account"
        description="Manage your Lingo subscription, view usage, and upgrade to Pro."
      />
      <div className="legal-page">
      <div className="container">
        <h1>Account</h1>
        <p className="last-updated">Manage your subscription</p>

        <div className="legal-content">
          <section>
            <h2>Current Plan</h2>
            <div className="account-card">
              <h3>Free Tier</h3>
              <p>2 hours of translation per day</p>
              <Link to="/pricing" className="cta">Upgrade to Pro</Link>
            </div>
          </section>

          <section>
            <h2>Usage</h2>
            <div className="account-card">
              <p><strong>Today's usage:</strong> 0 / 2 hours</p>
              <p><strong>Next refill:</strong> In 2 hours</p>
            </div>
          </section>

          <section>
            <h2>Account Details</h2>
            <div className="account-card">
              <p><strong>Email:</strong> user@example.com</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </section>

          <div className="auth-notice">
            <p><strong>Production Configuration Required:</strong> Account management is not yet implemented. This page is a placeholder. Configure authentication backend and account management before public launch.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
