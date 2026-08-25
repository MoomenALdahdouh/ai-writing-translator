import SEO from '../components/SEO'
import './Privacy.css'

export default function RefundPolicy() {
  return (
    <>
      <SEO 
        title="Lingo Refund Policy"
        description="Learn about Lingo's refund policy. First month free trial. Cancel anytime."
      />
      <div className="legal-page">
      <div className="container">
        <h1>Refund Policy</h1>
        <p className="last-updated">Last Updated: August 24, 2026</p>

        <div className="legal-content">
          <section>
            <h2>1. First Month Free Trial</h2>
            <p>New Lingo Pro subscriptions include a first month free trial. You will not be charged during the trial period. You can cancel anytime before the trial ends with no charge.</p>
          </section>

          <section>
            <h2>2. Refund Requests</h2>
            <p>Refund requests are handled on a case-by-case basis. To request a refund, please contact our support team through the <a href="/contact">contact page</a>.</p>
          </section>

          <section>
            <h2>3. Refund Eligibility</h2>
            <p>Refund eligibility depends on:</p>
            <ul>
              <li>Time since subscription start</li>
              <li>Reason for refund request</li>
              <li>Usage of the service during the billing period</li>
              <li>Payment provider policies</li>
            </ul>
          </section>

          <section>
            <h2>4. Payment Provider Policies</h2>
            <p>Payments are processed through Lemon Squeezy. Refund policies and processing times are subject to Lemon Squeezy's terms and conditions. We do not control the refund process once a request is submitted.</p>
          </section>

          <section>
            <h2>5. Cancellation vs Refund</h2>
            <p>Cancellation stops future charges but does not provide a refund for the current billing period. Refunds return charges for the current or past billing periods.</p>
          </section>

          <section>
            <h2>6. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ol>
              <li>Contact us through the <a href="/contact">contact page</a></li>
              <li>Provide your email address and subscription details</li>
              <li>Explain the reason for your refund request</li>
              <li>Our team will review your request and respond within 5 business days</li>
            </ol>
          </section>

          <section>
            <h2>7. Processing Time</h2>
            <p>Refund processing times depend on your payment method and bank. Please allow 5-10 business days for refunds to appear in your account after approval.</p>
          </section>

          <section>
            <h2>8. Legal Review Required</h2>
            <p>This refund policy describes our general approach but may need adjustment based on jurisdiction and specific business requirements. Legal review is required before public launch.</p>
          </section>

          <section>
            <h2>9. Contact</h2>
            <p>If you have questions about refunds, please contact us at:</p>
            <p><a href="/contact">Contact Page</a></p>
          </section>
        </div>
      </div>
    </div>
    </>
  )
}
