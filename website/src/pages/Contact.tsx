import SEO from '../components/SEO'
import './Privacy.css'

export default function Contact() {
  return (
    <>
      <SEO 
        title="Lingo Contact"
        description="Contact Lingo support for help with your account, billing, or technical issues."
      />
      <div className="legal-page">
      <div className="container">
        <h1>Contact Us</h1>
        <p className="last-updated">We'd love to hear from you</p>

        <div className="legal-content">
          <section>
            <h2>Email</h2>
            <p>For general inquiries, support, or feedback, please email us at:</p>
            <p><strong>support@lingo.zaixos.com</strong></p>
          </section>

          <section>
            <h2>Response Time</h2>
            <p>We typically respond to inquiries within 1-2 business days. For urgent matters, please indicate the urgency in your subject line.</p>
          </section>

          <section>
            <h2>What We Can Help With</h2>
            <ul>
              <li>Technical support and troubleshooting</li>
              <li>Billing and subscription questions</li>
              <li>Refund requests</li>
              <li>Feature requests and feedback</li>
              <li>Partnership inquiries</li>
              <li>Press and media inquiries</li>
            </ul>
          </section>

          <section>
            <h2>Production Configuration Required</h2>
            <p>The contact email address above is a placeholder. Before public launch, configure a real working email address and set up proper email infrastructure.</p>
          </section>

          <section>
            <h2>Alternative Contact Methods</h2>
            <p>Additional contact methods may be added in the future based on user needs and support volume.</p>
          </section>
        </div>
      </div>
    </div>
    </>
  )
}
