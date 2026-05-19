import LegalLayout from './LegalLayout'

export default function About() {
  return (
    <LegalLayout
      title="About DevTools Online"
      description="DevTools Online is a free collection of 120+ developer utilities. Every tool processes your data locally in the browser — no sign-up, no input data sent to our servers."
      path="/about/"
    >
      <p>
        <strong>DevTools Online</strong> is a curated collection of more than 120 developer
        utilities — formatters, validators, encoders, generators, converters, and inspectors —
        designed to replace the dozens of small, ad-heavy, single-purpose websites engineers tend
        to bookmark over the years.
      </p>

      <h2>What makes it different</h2>
      <ul>
        <li>
          <strong>Tools run entirely in your browser.</strong> JSON, SQL, JWT, hashes, certificates —
          the data you paste into a tool is processed locally and never sent to our servers. (The
          website itself uses standard analytics and advertising — see our{' '}
          <a href="/privacy/">Privacy Policy</a> for details.)
        </li>
        <li>
          <strong>No sign-up, no paywall.</strong> Every tool is available immediately and free of
          charge.
        </li>
        <li>
          <strong>Fast.</strong> Static assets are served from a global CDN; tool code is
          lazy-loaded so the homepage stays light.
        </li>
        <li>
          <strong>Installable as a PWA.</strong> Add DevTools Online to your home screen or desktop
          for offline use.
        </li>
        <li>
          <strong>Open ecosystem.</strong> An MCP server (<code>devtoolsonline-mcp</code>) lets AI
          assistants like Claude or Cursor call the same utilities programmatically.
        </li>
      </ul>

      <h2>What's inside</h2>
      <p>The toolkit is organized into categories, including:</p>
      <ul>
        <li>
          <strong>JSON tools</strong> — formatter, validator, diff, JSON↔CSV, JSON↔YAML, JSON↔XML,
          JSON to TypeScript / C# / Go
        </li>
        <li>
          <strong>Encoding</strong> — Base64, URL, HTML entities, JWT, MIME, certificate decoding
        </li>
        <li>
          <strong>Crypto &amp; security</strong> — MD5, SHA-1/256/512, BCrypt, AES, TOTP, password
          generators, password strength
        </li>
        <li>
          <strong>Web &amp; network</strong> — DNS lookup, SSL checker, IP geolocation, HTTP
          inspector, user-agent parser, CIDR calculator
        </li>
        <li>
          <strong>Formatters</strong> — SQL, XML, YAML, HTML, CSS, Markdown, code minifiers
        </li>
        <li>
          <strong>Generators</strong> — UUID, NanoID, QR codes, barcodes, favicons, mock data,
          Lorem Ipsum
        </li>
        <li>
          <strong>Color &amp; design</strong> — color converters, contrast checker, gradient and
          shadow generators, image compression
        </li>
        <li>
          <strong>Diagrams</strong> — Mermaid renderer, ERD builder from SQL, SQL execution-plan
          viewer
        </li>
      </ul>
      <p>
        See the full list on the <a href="/tools/">All Tools</a> page or browse by category from
        the sidebar.
      </p>

      <h2>Who builds it</h2>
      <p>
        DevTools Online is an independent project maintained by a small team of working software
        engineers based in Vietnam. We started building these tools to solve our own daily problems
        — formatting JSON in a meeting, decoding a JWT during an incident, generating a UUID for a
        migration script — and decided to keep them free and open for every developer.
      </p>
      <p>
        The project launched in 2024 and has grown to 125+ tools across 16 categories, used by
        tens of thousands of developers each month. Every tool is hand-crafted, tested, and
        documented by our team before release.
      </p>

      <h2>How it's funded</h2>
      <p>
        The Service is funded primarily by <strong>display advertising</strong> — non-intrusive ads
        on listing and landing pages, never inside the tool workspace itself.
        Funding from advertising lets us keep every tool free and avoid paywalls, account
        requirements, or upsells of any kind.
      </p>

      <h2>Get in touch</h2>
      <p>
        Found a bug, have a tool idea, or want to say hi? Email us at{' '}
        <a href="mailto:support@devtoolsonline.dev">support@devtoolsonline.dev</a> or visit
        our <a href="/contact/">contact page</a> for more options.
      </p>
    </LegalLayout>
  )
}
