import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import './Pricing.css'

export default function Pricing() {
  return (
    <>
      <SEO 
        title="Lingo Pricing — Simple AI Translation"
        description="Start free with 2 hours of translation per day. Upgrade to Lingo Pro for unlimited translation at $1.99/month with first month free."
      />
      <div className="pricing-page">
        <div className="container">
          <div className="pricing-header">
            <h1>Simple, Transparent Pricing</h1>
            <p>Start free. Upgrade when you need more.</p>
          </div>

          <div className="pricing-cards">
            <div className="pricing-card">
              <h2>Free</h2>
              <div className="price">$0</div>
              <div className="period">Forever</div>
              <ul className="features">
                <li>2 hours of translation per day</li>
                <li>Automatic refills every 5 hours</li>
                <li>12 language pairs</li>
                <li>Chrome & Edge support</li>
                <li>Keyboard shortcut translation</li>
              </ul>
              <Link to="/signup" className="cta">Get Started Free</Link>
            </div>

            <div className="pricing-card pro">
              <div className="first-month-free">First month free</div>
              <h2>Lingo Pro</h2>
              <div className="price">$1.99</div>
              <div className="period">/month after free trial</div>
              <ul className="features">
                <li>Unlimited translation</li>
                <li>First month free</li>
                <li>Priority processing</li>
                <li>All language pairs</li>
                <li>Chrome & Edge support</li>
                <li>Keyboard shortcut translation</li>
              </ul>
              <Link to="/signup" className="cta">Start First Month Free</Link>
            </div>

            <div className="pricing-card annual">
              <div className="first-month-free">First month free</div>
              <h2>Lingo Pro Annual</h2>
              <div className="price">$19.99</div>
              <div className="period">/year</div>
              <ul className="features">
                <li>Unlimited translation</li>
                <li>First month free</li>
                <li>Priority processing</li>
                <li>All language pairs</li>
                <li>Chrome & Edge support</li>
                <li>Keyboard shortcut translation</li>
                <li>Save ~16% vs monthly</li>
              </ul>
              <Link to="/signup" className="cta">Start First Month Free</Link>
            </div>
          </div>

          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-items">
              <div className="faq-item">
                <h3>What does "First month free" mean?</h3>
                <p>When you upgrade to Lingo Pro, your first month is completely free. You can cancel anytime before the month ends with no charge.</p>
              </div>
              <div className="faq-item">
                <h3>Can I cancel my subscription?</h3>
                <p>Yes, you can cancel your subscription at any time. Your access continues until the end of your current billing period.</p>
              </div>
              <div className="faq-item">
                <h3>What payment methods do you accept?</h3>
                <p>We accept all major credit cards and payment methods supported by Lemon Squeezy.</p>
              </div>
              <div className="faq-item">
                <h3>Is the free tier really free?</h3>
                <p>Yes, the free tier is completely free with no payment required. It includes 2 hours of translation per day with automatic refills.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
