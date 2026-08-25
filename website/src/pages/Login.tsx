import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import './Privacy.css'

export default function Login() {
  return (
    <>
      <SEO 
        title="Lingo Login"
        description="Log in to your Lingo account to manage your subscription and translation settings."
      />
      <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1>Log in to Lingo</h1>
          <p className="auth-subtitle">Enter your email to access your account</p>

          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="you@example.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" placeholder="••••••••" required />
            </div>

            <button type="submit" className="cta primary">Log In</button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            <p><Link to="/forgot-password">Forgot password?</Link></p>
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
