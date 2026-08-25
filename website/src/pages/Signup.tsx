import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import './Privacy.css'

export default function Signup() {
  return (
    <>
      <SEO 
        title="Lingo Sign Up"
        description="Create a Lingo account to start translating naturally. First month free trial available."
      />
      <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1>Sign up for Lingo</h1>
          <p className="auth-subtitle">Start translating naturally</p>

          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" placeholder="••••••••" required />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input type="password" id="confirm-password" name="confirm-password" placeholder="••••••••" required />
            </div>

            <button type="submit" className="cta primary">Create Account</button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Log in</Link></p>
          </div>

          <div className="auth-notice">
            <p><strong>Production Configuration Required:</strong> Authentication is not yet implemented. This page is a placeholder. Configure authentication backend before public launch.</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
