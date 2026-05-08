import LegalLayout from './LegalLayout'

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="Terms and conditions for using DevTools Online — a free collection of browser-based developer tools."
      path="/terms/"
      lastUpdated="May 8, 2026"
    >
      <p>
        These Terms of Service ("Terms") govern your access to and use of DevTools Online (the
        "Service"), available at <a href="https://devtoolsonline.dev/">https://devtoolsonline.dev/</a>.
        By using the Service, you agree to be bound by these Terms. If you do not agree, do not use
        the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        DevTools Online is a free, browser-based collection of developer utilities (formatters,
        validators, generators, encoders, and similar tools). All tool processing happens in your
        browser; no input data is transmitted to our servers.
      </p>

      <h2>2. No account required</h2>
      <p>
        You may use the Service without creating an account. We do not collect personal information
        beyond what is described in our{' '}
        <a href="/privacy/">Privacy Policy</a>.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Violate any applicable law, regulation, or third-party right;</li>
        <li>Generate, encode, or process content that is illegal, harmful, or infringing;</li>
        <li>Attempt to disrupt, attack, or reverse engineer the Service or its infrastructure;</li>
        <li>Scrape, redistribute, or resell the Service or its outputs in a way that competes with us;</li>
        <li>Bypass rate limits, CAPTCHAs, or other security controls.</li>
      </ul>

      <h2>4. Intellectual property</h2>
      <p>
        The Service, including its source code, design, content, and branding, is owned by us or
        our licensors. You retain all rights to any content you process through the Service —
        because we do not store or transmit it, you remain the sole controller of your data.
      </p>
      <p>
        Tool outputs (formatted code, generated UUIDs, etc.) are yours to use freely.
      </p>

      <h2>5. No warranty</h2>
      <p>
        The Service is provided "AS IS" and "AS AVAILABLE", without warranties of any kind, express
        or implied. We do not warrant that the Service will be uninterrupted, error-free, or free
        of harmful components. Any tool output should be reviewed before being relied upon for
        production, security, legal, or financial decisions.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, we are not liable for any indirect, incidental,
        special, consequential, or punitive damages, or any loss of profits, data, or business
        arising from your use of the Service. Our total liability for any claim related to the
        Service is limited to USD $100.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        The Service may include third-party content, links, or integrations (e.g., Google
        Analytics, Google AdSense, GitHub). We are not responsible for third-party content or
        practices. Your use of third-party services is governed by their own terms.
      </p>

      <h2>8. Advertising</h2>
      <p>
        The Service may display advertisements served by Google AdSense or other ad networks.
        Advertisements are not endorsements. Clicking on an ad is at your own discretion and risk.
      </p>

      <h2>9. Changes to the Service</h2>
      <p>
        We may add, modify, or remove tools and features at any time without notice. We may also
        modify these Terms; the updated Terms become effective when posted on this page.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate your access to the Service at any time, with or without notice,
        if you violate these Terms or engage in conduct that we determine to be harmful to the
        Service or its users.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which the Service is operated,
        without regard to conflict-of-laws principles. Any dispute will be resolved in the courts
        of that jurisdiction.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms? Visit the <a href="/contact/">contact page</a> to reach us via
        GitHub Issues or the in-app feedback button.
      </p>
    </LegalLayout>
  )
}
