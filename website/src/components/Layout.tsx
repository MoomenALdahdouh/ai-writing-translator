import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import './Layout.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo">Lingo</Link>
          
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>

          <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  onClick={() => setMobileMenuOpen(false)}
                  className={location.pathname === link.path ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/pricing" className="nav-cta" onClick={() => setMobileMenuOpen(false)}>
                Try Lingo Free
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/refund-policy">Refund Policy</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <p>© 2026 Lingo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
