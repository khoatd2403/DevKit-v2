import LegalLayout from './LegalLayout'

export default function About() {
  return (
    <LegalLayout
      title="About DevTools Online"
      description="DevTools Online is a free, privacy-first collection of 120+ developer utilities. Every tool runs entirely in your browser — no sign-up, no tracking, no data sent to a server."
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
          <strong>Runs entirely in your browser.</strong> JSON, SQL, JWT, hashes, certificates —
          nothing you paste leaves your device.
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
        engineers. We started building these tools to solve our own problems — formatting JSON in a
        meeting, decoding a JWT during an incident, generating a UUID for a migration script — and
        decided to keep them free for everyone.
      </p>
      <p>
        Source code, issues, and contributions are welcome on{' '}
        <a
          href="https://github.com/khoatd2403/DevKit-v2"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>

      <h2>How it's funded</h2>
      <p>
        The Service is funded primarily by:
      </p>
      <ul>
        <li>
          <strong>Display advertising</strong> — non-intrusive ads on listing and landing pages
          (never inside the tool workspace).
        </li>
        <li>
          <strong>Voluntary support</strong> — readers who want to help can{' '}
          <a
            href="https://paypal.me/tranphu0ng"
            target="_blank"
            rel="noopener noreferrer"
          >
            support the project on PayPal
          </a>
          .
        </li>
      </ul>
      <p>
        Funding from advertising lets us keep every tool free and avoid building paywalls,
        registrations, or upsells.
      </p>

      <h2>Get in touch</h2>
      <p>
        Found a bug, have an idea for a tool, or want to say hi? Visit our{' '}
        <a href="/contact/">contact page</a> — open a GitHub issue or send feedback right from the
        app (Ctrl + Shift + F).
      </p>
    </LegalLayout>
  )
}
