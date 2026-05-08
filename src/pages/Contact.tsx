import LegalLayout from './LegalLayout'

export default function Contact() {
  return (
    <LegalLayout
      title="Contact Us"
      description="Get in touch with the DevTools Online team — report a bug, request a feature, or ask a question."
      path="/contact/"
    >
      <p>
        DevTools Online is open source and community-driven. The fastest way to reach us is through
        one of the channels below — every message is read by the core team.
      </p>

      <h2>1. In-app feedback (fastest)</h2>
      <p>
        Anywhere on the site, press <strong>Ctrl + Shift + F</strong> (or <strong>⌘ + Shift + F</strong>{' '}
        on macOS) to open the feedback panel. Pick a type — bug, feature request, UX issue, or
        general — and submit. The form posts directly to our GitHub issue tracker.
      </p>

      <h2>2. Bug reports &amp; feature requests on GitHub</h2>
      <p>
        Public, transparent, and lets other users follow along:
      </p>
      <ul>
        <li>
          <a
            href="https://github.com/khoatd2403/DevKit-v2/issues/new?labels=bug&title=Bug%3A%20"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report a bug →
          </a>
        </li>
        <li>
          <a
            href="https://github.com/khoatd2403/DevKit-v2/issues/new?labels=enhancement&title=Feature%3A%20"
            target="_blank"
            rel="noopener noreferrer"
          >
            Request a feature →
          </a>
        </li>
        <li>
          <a
            href="https://github.com/khoatd2403/DevKit-v2/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Browse all open issues →
          </a>
        </li>
      </ul>

      <h2>3. Privacy &amp; data requests</h2>
      <p>
        For GDPR / CCPA requests or anything related to our{' '}
        <a href="/privacy/">Privacy Policy</a>, open a GitHub issue with the label{' '}
        <code>privacy</code> or send feedback in-app with type <em>"General"</em>. Because we do
        not operate user accounts, most "data deletion" requests are satisfied automatically — your
        browser holds all of your data.
      </p>

      <h2>4. Security disclosures</h2>
      <p>
        Found a security issue? Please <strong>do not</strong> open a public issue. Use{' '}
        <a
          href="https://github.com/khoatd2403/DevKit-v2/security/advisories/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub's private security advisory form
        </a>{' '}
        — only the maintainers will see the report.
      </p>

      <h2>5. Open source &amp; contributions</h2>
      <p>
        Source code lives on{' '}
        <a
          href="https://github.com/khoatd2403/DevKit-v2"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        . Pull requests, suggestions for new tools, and improvements are welcome.
      </p>

      <h2>Response time</h2>
      <p>
        We aim to triage every report within 3 business days. Bugs that block tool functionality
        are usually fixed within a week.
      </p>
    </LegalLayout>
  )
}
