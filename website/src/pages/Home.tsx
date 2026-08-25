import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import './Home.css'

export default function Home() {
  return (
    <>
      <SEO 
        title="Lingo — Write naturally. Translate instantly."
        description="Write in the language you think in. Lingo translates your text directly where you type."
      />
      <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Write naturally. Translate instantly.</h1>
          <p>Write in the language you think in. Lingo translates your text directly where you type.</p>
          <div className="hero-ctas">
            <Link to="/pricing" className="cta primary">Try Lingo Free</Link>
            <Link to="#how-it-works" className="cta secondary">See how it works</Link>
          </div>
        </div>
      </section>

      {/* Product Demonstration */}
      <section className="demo">
        <div className="container">
          <div className="demo-box">
            <div className="demo-text arabic">مرحبا، أريد معرفة المزيد عن هذا المنتج.</div>
            <div className="demo-arrow">↓ Ctrl+Shift+,</div>
            <div className="demo-text english">Hello, I would like to know more about this product.</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle">Translate your writing in 3 simple steps</p>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Choose your languages</h3>
              <p>Select your source and target languages from 12 supported options</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Write naturally</h3>
              <p>Type in your preferred language without switching keyboards or tools</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Translate directly where you type</h3>
              <p>Press Ctrl+Shift+, to translate instantly without leaving the page</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features">
        <div className="container">
          <h2 className="section-title">Features</h2>
          <p className="section-subtitle">Built for seamless multilingual writing</p>
          <div className="feature-grid">
            <div className="feature">
              <h3>AI-Powered Translation</h3>
              <p>Contextual translation powered by advanced AI models</p>
            </div>
            <div className="feature">
              <h3>Multiple Languages</h3>
              <p>Support for 12 major languages including Arabic, Spanish, French, and more</p>
            </div>
            <div className="feature">
              <h3>Keyboard Shortcut</h3>
              <p>Quick translation with Ctrl+Shift+, (or ⌘+Shift+, on Mac)</p>
            </div>
            <div className="feature">
              <h3>In-Place Translation</h3>
              <p>Translates directly in text fields without copy-paste</p>
            </div>
            <div className="feature">
              <h3>Chrome Support</h3>
              <p>Works seamlessly in Google Chrome browser</p>
            </div>
            <div className="feature">
              <h3>Edge Support</h3>
              <p>Compatible with Microsoft Edge browser</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="section languages">
        <div className="container">
          <h2 className="section-title">Supported Languages</h2>
          <p className="section-subtitle">Translate between 12 major languages</p>
          <div className="language-grid">
            <div className="language">English</div>
            <div className="language">Arabic</div>
            <div className="language">Turkish</div>
            <div className="language">Spanish</div>
            <div className="language">French</div>
            <div className="language">German</div>
            <div className="language">Portuguese</div>
            <div className="language">Italian</div>
            <div className="language">Russian</div>
            <div className="language">Chinese</div>
            <div className="language">Japanese</div>
            <div className="language">Korean</div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Use Cases</h2>
          <p className="section-subtitle">Perfect for multilingual communication</p>
          <div className="use-cases">
            <div className="use-case">
              <h3>Email & Messaging</h3>
              <p>Write emails and messages in your native language, then translate for international colleagues and friends</p>
            </div>
            <div className="use-case">
              <h3>Social Media</h3>
              <p>Create content for global audiences without leaving your favorite platforms</p>
            </div>
            <div className="use-case">
              <h3>Documentation</h3>
              <p>Write technical documentation in your preferred language and translate for broader reach</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="section privacy">
        <div className="container">
          <h2 className="section-title">Privacy & Security</h2>
          <p className="section-subtitle">Your data stays secure</p>
          <div className="privacy-features">
            <div className="privacy-feature">
              <div className="privacy-icon">🔒</div>
              <div>
                <h3>Protected Fields</h3>
                <p>Passwords, payment fields, and sensitive inputs are never translated</p>
              </div>
            </div>
            <div className="privacy-feature">
              <div className="privacy-icon">🚫</div>
              <div>
                <h3>No Data Storage</h3>
                <p>Your translation text is never stored or logged</p>
              </div>
            </div>
            <div className="privacy-feature">
              <div className="privacy-icon">🔐</div>
              <div>
                <h3>Server-Side AI</h3>
                <p>API keys never leave the server — your extension stays secure</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="section pricing-preview">
        <div className="container">
          <h2 className="section-title">Simple Pricing</h2>
          <p className="section-subtitle">Start free, upgrade when you need more</p>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">$0</div>
              <div className="period">Forever</div>
              <ul className="features">
                <li>2 hours of translation per day</li>
                <li>Automatic refills every 5 hours</li>
                <li>12 language pairs</li>
                <li>Chrome & Edge support</li>
              </ul>
              <Link to="/pricing" className="cta">Get Started Free</Link>
            </div>
            <div className="pricing-card pro">
              <div className="first-month-free">First month free</div>
              <h3>Lingo Pro</h3>
              <div className="price">$1.99</div>
              <div className="period">/month after free trial</div>
              <ul className="features">
                <li>Unlimited translation</li>
                <li>First month free</li>
                <li>Priority processing</li>
                <li>All language pairs</li>
              </ul>
              <Link to="/pricing" className="cta">Start First Month Free</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to break language barriers?</h2>
          <p>Write naturally. Translate instantly.</p>
          <Link to="/pricing" className="cta">Try Lingo Free</Link>
        </div>
      </section>
    </div>
    </>
  )
}
