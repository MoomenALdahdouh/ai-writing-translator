import SEO from '../components/SEO'
import './Privacy.css'

export default function Privacy() {
  return (
    <>
      <SEO 
        title="Lingo Privacy Policy"
        description="Learn how Lingo protects your data. Your translation text is not stored. Protected fields are never translated."
      />
      <div className="legal-page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: August 24, 2026</p>

        <div className="legal-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>Lingo collects the following information:</p>
            <ul>
              <li><strong>Translation text:</strong> When you use Lingo to translate text, the text you are translating is sent to our API for processing</li>
              <li><strong>Language preferences:</strong> Your source and target language settings</li>
              <li><strong>Usage data:</strong> Translation usage statistics for entitlement purposes</li>
              <li><strong>Account information:</strong> Email address and subscription status (for Pro users)</li>
              <li><strong>Payment information:</strong> Processed securely through Lemon Squeezy (we do not store payment details)</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide translation services</li>
              <li>Manage your subscription and billing</li>
              <li>Enforce usage limits and entitlements</li>
              <li>Improve our service quality</li>
            </ul>
          </section>

          <section>
            <h2>2.1. When Text is Sent for Translation</h2>
            <p>Your text is sent to our API when:</p>
            <ul>
              <li>You use the keyboard shortcut (Ctrl+Shift+,) to translate selected text</li>
              <li>You use live translation mode and complete a sentence</li>
            </ul>
          </section>

          <section>
            <h2>3. Data Storage and Retention</h2>
            <p><strong>Translation text:</strong> Your translation text is NOT stored in our database. It is processed by our AI provider (Groq) and then discarded.</p>
            <p><strong>Account data:</strong> Your account information is stored securely and retained as long as your account is active.</p>
            <p><strong>Usage data:</strong> Usage statistics are stored to manage your entitlements and free tier allowance.</p>
          </section>

          <section>
            <h2>4. Data Logging</h2>
            <p>Our backend logs do NOT include your translation text. Logs contain:</p>
            <ul>
              <li>Request ID</li>
              <li>Path and status</li>
              <li>Latency</li>
              <li>Language pair</li>
              <li>Character count</li>
              <li>Error category (if applicable)</li>
            </ul>
            <p><strong>Important:</strong> Groq's own data retention policies are outside our control. Please review Groq's privacy policy for information about their data handling.</p>
          </section>

          <section>
            <h2>5. Protected Fields</h2>
            <p>Lingo automatically protects sensitive fields and does NOT translate text from:</p>
            <ul>
              <li>Password fields</li>
              <li>OTP/PIN fields</li>
              <li>Credit card/CVV fields</li>
              <li>Payment forms</li>
              <li>Username/email fields</li>
              <li>URL fields</li>
              <li>File inputs</li>
              <li>Hidden inputs</li>
              <li>Code editors</li>
              <li>Browser consoles</li>
            </ul>
            <p>Uncertain field types are treated as protected and not translated.</p>
          </section>

          <section>
            <h2>6. AI Provider (Groq)</h2>
            <p>Lingo uses Groq's AI models for translation. Your text is sent to Groq's API for processing. We do not control Groq's data retention or logging practices.</p>
            <p><strong>Legal Review Required:</strong> This privacy policy describes our implementation but does not constitute legal compliance. Legal review is required before public launch.</p>
          </section>

          <section>
            <h2>7. Analytics</h2>
            <p>Lingo does NOT use analytics SDKs that collect translation text. We do not ship invasive analytics by default.</p>
            <p>If we add analytics in the future, we will update this policy and obtain appropriate consent where required by law.</p>
          </section>

          <section>
            <h2>8. Cookies</h2>
            <p>Lingo does not use cookies for tracking purposes. We may use essential cookies for authentication and session management.</p>
          </section>

          <section>
            <h2>9. Security Practices</h2>
            <p>We implement security measures including:</p>
            <ul>
              <li>Server-side API keys (never exposed to the browser)</li>
              <li>HTTPS for all communications</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Secure authentication sessions</li>
              <li>Regular security audits</li>
            </ul>
          </section>

          <section>
            <h2>10. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Opt out of data processing</li>
              <li>Data portability</li>
            </ul>
            <p><strong>Legal Review Required:</strong> Specific rights and procedures depend on applicable laws (GDPR, CCPA, etc.) and require legal review.</p>
          </section>

          <section>
            <h2>11. Third-Party Services</h2>
            <p>Lingo uses the following third-party services:</p>
            <ul>
              <li><strong>Groq:</strong> AI translation models</li>
              <li><strong>Lemon Squeezy:</strong> Payment processing and subscription management</li>
            </ul>
            <p>Each service has its own privacy policy. By using Lingo, you agree to their terms and privacy policies.</p>
          </section>

          <section>
            <h2>12. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify users of significant changes via email or through our website.</p>
          </section>

          <section>
            <h2>13. Contact</h2>
            <p>If you have questions about this privacy policy or our data practices, please contact us at:</p>
            <p><a href="/contact">Contact Page</a></p>
          </section>
        </div>
      </div>
    </div>
    </>
  )
}
