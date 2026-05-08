import LegalLayout from './LegalLayout'

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="DevTools Online privacy policy. Learn what data we collect, how we use cookies, and your rights as a user."
      path="/privacy/"
      lastUpdated="May 8, 2026"
    >
      <p>
        DevTools Online ("we", "our", or "us") operates the website{' '}
        <a href="https://devtoolsonline.dev/">https://devtoolsonline.dev/</a> (the "Service").
        This page explains what information is collected when you use the Service, how it is used,
        and the choices you have.
      </p>

      <h2>Client-side processing</h2>
      <p>
        Every developer tool on DevTools Online runs entirely in your browser. Inputs you provide
        to formatters, validators, encoders, generators, and similar utilities are processed locally
        and are not transmitted to any server operated by us. We never see, store, or share the
        content you paste into a tool.
      </p>

      <h2>Information we collect</h2>
      <h3>1. Browser storage (no account, no PII)</h3>
      <p>We use <code>localStorage</code> on your device to remember preferences such as:</p>
      <ul>
        <li>Theme (light / dark / system)</li>
        <li>Favorite tools and recently used tools</li>
        <li>Language preference</li>
        <li>Editor settings (font size, indentation, etc.)</li>
      </ul>
      <p>
        This data never leaves your device. You can clear it at any time via your browser settings.
      </p>

      <h3>2. Analytics (Google Analytics 4)</h3>
      <p>
        We use Google Analytics 4 to understand aggregate usage — page views, referrers, country,
        device type, and similar metrics. Analytics cookies are only set with your consent via the
        cookie banner. We do not collect personally identifiable information through analytics, and
        we have IP anonymization enabled.
      </p>
      <p>
        For details, see{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google's Privacy Policy
        </a>.
      </p>

      <h3>3. Advertising (Google AdSense)</h3>
      <p>
        DevTools Online may display ads served by Google AdSense. Google and its partners may use
        cookies to serve ads based on your prior visits to this and other websites. You can opt out
        of personalized advertising by visiting{' '}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          Google's Ad Settings
        </a>.
      </p>
      <p>
        For users in the European Economic Area (EEA), the United Kingdom, and Switzerland, Google
        complies with the IAB Europe Transparency &amp; Consent Framework. We will request your
        consent before any non-essential cookies are placed.
      </p>

      <h3>4. Hosting and CDN logs</h3>
      <p>
        Our hosting provider (Netlify) automatically logs standard request data (IP address, user
        agent, timestamp, URL) for security and reliability purposes. These logs are retained
        according to{' '}
        <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">
          Netlify's privacy policy
        </a>
        .
      </p>

      <h2>What we do NOT do</h2>
      <ul>
        <li>We do not require an account or login.</li>
        <li>We do not store the content you paste, type, or upload into any tool.</li>
        <li>We do not sell or share personal data with third parties for marketing.</li>
        <li>We do not use fingerprinting or cross-site trackers beyond the analytics/ads above.</li>
      </ul>

      <h2>Cookies</h2>
      <p>The Service uses three categories of cookies:</p>
      <ul>
        <li>
          <strong>Essential</strong> — required to remember your preferences. Stored in
          <code> localStorage</code>, not transmitted.
        </li>
        <li>
          <strong>Analytics</strong> — Google Analytics 4. Set only after consent.
        </li>
        <li>
          <strong>Advertising</strong> — Google AdSense. Set only after consent in regions where
          consent is required.
        </li>
      </ul>
      <p>
        You can manage your consent at any time by clearing site data in your browser, after which
        the consent banner will reappear.
      </p>

      <h2>Children</h2>
      <p>
        The Service is not directed to children under 13. We do not knowingly collect personal
        information from children. If you believe a child has provided us with personal information,
        please contact us and we will delete it.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on your jurisdiction (e.g., GDPR in the EEA, CCPA in California), you may have the
        right to access, correct, or delete personal data we hold about you. Because we do not
        operate user accounts, we typically do not hold personal data tied to you. For analytics or
        ads opt-out, use the links above. For any other request, see the{' '}
        <a href="/contact/">contact page</a>.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The "Last updated" date at the top of
        this page reflects the latest revision. Continued use of the Service after a change
        constitutes acceptance of the revised policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or concerns? Visit the <a href="/contact/">contact page</a> — you can reach us
        through GitHub Issues or the in-app feedback button.
      </p>
    </LegalLayout>
  )
}
