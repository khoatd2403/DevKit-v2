import LegalLayout from './LegalLayout'

export default function Contact() {
  return (
    <LegalLayout
      title="Contact Us"
      description="Get in touch with the DevTools Online team — report a bug, request a feature, or ask a question."
      path="/contact/"
    >
      <p>
        DevTools Online is maintained by a small team of developers. You can reach us by email or
        through the in-app feedback panel — every message is read and we respond to every inquiry.
      </p>

      <h2>1. Email (general inquiries)</h2>
      <p>
        For any question, partnership request, or general feedback, email us at{' '}
        <a href="mailto:support@devtoolsonline.dev">support@devtoolsonline.dev</a>. We aim to
        respond within 2 business days.
      </p>

      <h2>2. In-app feedback (bugs &amp; features)</h2>
      <p>
        The fastest way to report a bug or request a feature is through the in-app feedback panel.
        Press <strong>Ctrl + Shift + F</strong> (or <strong>⌘ + Shift + F</strong> on macOS)
        anywhere on the site, choose a type — bug, feature request, or general — and submit.
        We read every report.
      </p>

      <h2>3. Privacy &amp; data requests</h2>
      <p>
        For GDPR / CCPA requests or anything related to our{' '}
        <a href="/privacy/">Privacy Policy</a>, email{' '}
        <a href="mailto:support@devtoolsonline.dev">support@devtoolsonline.dev</a> with the subject
        line <em>"Privacy Request"</em>. Because we do not operate user accounts, most data deletion
        requests are satisfied automatically — your browser holds all your data locally.
      </p>

      <h2>4. Security disclosures</h2>
      <p>
        Found a security vulnerability? Please <strong>do not</strong> post it publicly. Email{' '}
        <a href="mailto:support@devtoolsonline.dev">support@devtoolsonline.dev</a> with the subject
        line <em>"Security Disclosure"</em> — only the core maintainers will see the report.
        We will acknowledge receipt within 24 hours.
      </p>

      <h2>Response time</h2>
      <p>
        We aim to respond to all emails within 2 business days and triage bug reports within
        3 business days. Critical security issues are prioritised immediately.
      </p>
    </LegalLayout>
  )
}
