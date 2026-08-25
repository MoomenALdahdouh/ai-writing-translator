import SEO from '../components/SEO'
import './Privacy.css'

export default function FAQ() {
  return (
    <>
      <SEO 
        title="Lingo FAQ"
        description="Frequently asked questions about Lingo AI translation. Learn about features, pricing, languages, and more."
      />
      <div className="legal-page">
      <div className="container">
        <h1>Frequently Asked Questions</h1>
        <p className="last-updated">Common questions about Lingo</p>

        <div className="legal-content">
          <section>
            <h2>What is Lingo?</h2>
            <p>Lingo is a browser extension that lets you write naturally in your own language and translate directly where you type. It works in text fields and content-editable areas without requiring copy-paste.</p>
          </section>

          <section>
            <h2>How does Lingo translate text?</h2>
            <p>Lingo sends your text to our API, which uses AI models (Groq) to translate it. The translation is then returned and inserted directly in your text field.</p>
          </section>

          <section>
            <h2>Which languages are supported?</h2>
            <p>Lingo supports 12 languages: English, Arabic, Turkish, Spanish, French, German, Portuguese, Italian, Russian, Chinese, Japanese, and Korean.</p>
          </section>

          <section>
            <h2>Does Lingo use AI?</h2>
            <p>Yes, Lingo uses AI models (Groq) for contextual translation. This provides more accurate and natural translations compared to traditional translation methods.</p>
          </section>

          <section>
            <h2>Does Lingo work in Chrome?</h2>
            <p>Yes, Lingo works in Google Chrome. Download the extension from the Chrome Web Store.</p>
          </section>

          <section>
            <h2>Does Lingo work in Edge?</h2>
            <p>Yes, Lingo works in Microsoft Edge. Download the extension from the Microsoft Edge Add-ons store.</p>
          </section>

          <section>
            <h2>What happens to my text?</h2>
            <p>Your text is sent to our API for translation and then discarded. We do not store your translation text in our database. Protected fields like passwords and payment forms are never translated.</p>
          </section>

          <section>
            <h2>Does Lingo store translated text?</h2>
            <p>No, Lingo does not store your translation text. Your text is processed by our AI provider and then discarded. Our logs do not include your translation text.</p>
          </section>

          <section>
            <h2>Is Lingo free?</h2>
            <p>Yes, Lingo has a free tier that includes 2 hours of translation per day with automatic refills. The free tier is available at no cost.</p>
          </section>

          <section>
            <h2>What does Pro include?</h2>
            <p>Lingo Pro includes unlimited translation, priority processing, and access to all language pairs. Pro users also get first month free.</p>
          </section>

          <section>
            <h2>What does "First month free" mean?</h2>
            <p>When you upgrade to Lingo Pro, your first month is completely free. You can cancel anytime before the month ends with no charge.</p>
          </section>

          <section>
            <h2>When will I be charged?</h2>
            <p>You will be charged after your first month free trial ends. If you cancel before the trial ends, you will not be charged.</p>
          </section>

          <section>
            <h2>Can I cancel?</h2>
            <p>Yes, you can cancel your Pro subscription at any time. Cancellation takes effect at the end of the current billing period. You retain Pro access until the end of the paid period.</p>
          </section>

          <section>
            <h2>What happens after cancellation?</h2>
            <p>After cancellation, your access continues until the end of your current billing period. After that, you revert to the free tier with its usage limits.</p>
          </section>

          <section>
            <h2>How do I use the keyboard shortcut?</h2>
            <p>Press Ctrl+Shift+, (or ⌘+Shift+, on Mac) to translate the selected text or current writing segment. You can configure this shortcut in your browser extension settings.</p>
          </section>

          <section>
            <h2>What is live translation?</h2>
            <p>Live translation automatically translates your text as you complete sentences. This feature can be enabled in the extension settings.</p>
          </section>
        </div>
      </div>
    </div>
    </>
  )
}
