---
title: "HTTP Status Codes: The Ones You Actually Need to Know in 2026"
slug: "http-status-codes-2026"
description: "Skip the trivia. The 25 HTTP status codes that show up in production, what each one means, and the small set you should pick from when designing an API."
date: "2026-05-09"
author: "DevTools Online Team"
keywords:
  - http status codes
  - 200 vs 201
  - 401 vs 403
  - 422
  - rest api status codes
tags:
  - HTTP
  - Web
  - Reference
cover: "/og-image.svg"
excerpt: "There are 60+ HTTP status codes. About 25 matter. About 10 are the difference between a clear API and a confusing one. Here's the practical map."
---

The HTTP status code catalog is full of curiosities. 418 ("I'm a teapot") was an April Fool's joke and remains in the spec. 451 ("Unavailable For Legal Reasons") references Fahrenheit 451. 308 exists for "permanent redirects but POST stays POST" and almost nobody uses it.

Most of this trivia doesn't matter. The status codes that show up daily in real APIs are a much smaller set. This post is the practical map.

## The 25 codes that matter

### 2xx Success

**200 OK** — generic success. The request worked, the response has the data.

**201 Created** — used by POST when creating a resource. Convention: include a `Location` header pointing to the new resource. Many APIs use 200 here; 201 is more correct.

**202 Accepted** — request received, processing not yet complete. Useful for async operations: client gets a 202 with a job ID, polls another endpoint for status.

**204 No Content** — success, but nothing to send back. Common after DELETE or PUT. Don't include a body. Returning `200 OK` with `{}` is also fine; pick one and stick with it.

**206 Partial Content** — server is sending only part of the resource (Range request). Used for video streaming, large file downloads.

### 3xx Redirection

**301 Moved Permanently** — resource has a new URL, browsers and search engines should update bookmarks. Tells SEO crawlers "use the new URL going forward."

**302 Found** — temporary redirect. Use for "log in, then come back" flows.

**304 Not Modified** — server confirms cached version is still fresh. Response has no body. Sent in response to `If-Modified-Since` or `If-None-Match` headers.

**307 Temporary Redirect** — like 302, but POSTs stay POSTs. 302 was historically loose — different clients converted POST to GET on redirect, others preserved the method. 307 is unambiguous.

**308 Permanent Redirect** — like 301, method-preserving. Almost nobody uses it.

### 4xx Client Errors

**400 Bad Request** — malformed request. JSON parsing failed, required field missing. Generic for "this request is broken."

**401 Unauthorized** — authentication required or failed. Misleadingly named; should be "Unauthenticated." If the user isn't logged in (or token is missing/invalid), this is the right code.

**403 Forbidden** — user is authenticated but lacks permission. They're logged in, but they can't access this specific resource.

**404 Not Found** — resource doesn't exist. Also used (correctly or not) when the user lacks permission and you don't want to acknowledge the resource exists at all.

**405 Method Not Allowed** — endpoint exists, but not for that method. POST to a GET-only endpoint. Response should include an `Allow` header listing the supported methods.

**409 Conflict** — request can't be processed due to current state. Two writes racing on the same resource. The classic E-Tag optimistic locking case.

**410 Gone** — resource existed but is permanently removed. Tells crawlers "stop asking for this."

**415 Unsupported Media Type** — request `Content-Type` isn't one this endpoint accepts. Send JSON to a `multipart/form-data` endpoint, get 415.

**422 Unprocessable Entity** — request was syntactically valid (parsed correctly) but semantically wrong (validation failed). Common for form errors: "email format is invalid." Some APIs use 400 here; 422 is more specific.

**429 Too Many Requests** — rate limit hit. Usually paired with `Retry-After` header.

### 5xx Server Errors

**500 Internal Server Error** — something broke on the server. Generic. Don't leak stack traces in 5xx responses.

**502 Bad Gateway** — your reverse proxy (nginx, ALB, Cloudflare) couldn't reach the upstream server. Application is down or unhealthy.

**503 Service Unavailable** — server is intentionally not handling requests. Maintenance mode, or load shed. Include `Retry-After`.

**504 Gateway Timeout** — proxy reached the upstream but the upstream took too long to respond. Default proxy timeout is often 60 seconds.

**507 Insufficient Storage** — used by some APIs (mostly storage services like S3) when a quota is exceeded.

## The 10 that distinguish good APIs from bad

If you're designing an API, the status code you pick is part of the API contract. Here are the calls that matter most:

### POST that creates → 201, not 200

```
POST /users → 201 Created
Location: /users/42
```

Tells the client "this was a creation event." Non-creating POSTs (search, login) use 200.

### DELETE → 204 (or 200)

```
DELETE /users/42 → 204 No Content
```

The resource is gone. There's nothing to return. 204 is the cleanest answer; 200 with `{ deleted: true }` is OK if you want to be friendly.

### Validation failure → 422, not 400

```
POST /users with { email: "not-an-email" } → 422
{
  "errors": [
    { "field": "email", "message": "must be a valid email" }
  ]
}
```

422 says "I understood your request, but it failed validation." 400 says "I couldn't parse your request." Different errors, different recovery paths.

### Auth failure: 401 vs 403

```
No token → 401 Unauthorized
Wrong token → 401 Unauthorized
Valid token but no permission → 403 Forbidden
```

Clients distinguish these: 401 → redirect to login. 403 → show "you don't have access."

### Missing resource: 404, never 200 with `null`

```
GET /users/9999 → 404 Not Found, NOT 200 with body { user: null }
```

Returning 200 with a `null` body forces every client to check both status AND body. 404 is less ambiguous.

### Optimistic locking conflict → 409

```
PUT /docs/42 with stale version → 409 Conflict
{ "currentVersion": 5, "yourVersion": 3 }
```

The client knows to refetch and retry.

### Rate limit → 429 with Retry-After

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30

{ "error": "rate_limit_exceeded" }
```

The header gives clients an explicit "come back in 30 seconds."

### Maintenance mode → 503 with Retry-After

```
HTTP/1.1 503 Service Unavailable
Retry-After: 600
```

Better than 500. Tells clients (and CDNs and monitoring) "this is intentional, not a bug."

### Failed dependency: 502 or 503

If your service depends on another service that's down:

- Use **502** if you're acting as a proxy
- Use **503** if you're an app whose dependency is down

Don't return 500. 500 implies "we don't know what happened." You know what happened — your DB is down. Be specific.

### Async operation: 202 + status endpoint

```
POST /reports → 202 Accepted
Location: /jobs/abc-123

GET /jobs/abc-123 → 200 with { status: "running" }
GET /jobs/abc-123 → 200 with { status: "complete", result: "..." }
```

Don't make the client wait 30 seconds on the POST. Return 202 immediately and let them poll.

## Common mistakes

### Returning 200 for everything, with a status field in the body

```
HTTP/1.1 200 OK
{
  "status": "error",
  "code": 1042,
  "message": "user not found"
}
```

This is "200 anti-pattern." It breaks every HTTP-aware tool: monitoring dashboards show 100% success, CDNs cache errors as success, retry logic doesn't trigger. Use the status code.

### Using 200 with empty body where 204 fits

```
DELETE /users/42 → 200 OK
(empty body)
```

204 is more correct for "success, no body." 200 implies a body. Use the right one.

### Returning 500 for any error

```
POST /users (validation fails) → 500 Internal Server Error
```

500 is for "we don't know what's wrong." 422 (or 400) is for "your input is wrong." Returning 500 for client errors makes ops dashboards lie.

### Conflating 401 and 403

Cite this often enough and it stops happening: **401 = no auth or bad auth, 403 = good auth, no permission**.

### Returning HTML 404 from a JSON API

A JSON API client expects JSON. Returning a 404 HTML page on a missing endpoint breaks every JSON parser. Configure your framework to return JSON 404s for API routes.

## Quick reference card

```
2xx — Success
  200  generic OK
  201  created (POST)
  202  accepted (async)
  204  no content (DELETE, PUT)

3xx — Redirect
  301  permanent (SEO-friendly)
  302  temporary
  304  not modified (cache)
  307  temporary, preserve method

4xx — Client error
  400  bad request (parse error)
  401  not authenticated
  403  authenticated, not allowed
  404  not found
  405  method not allowed
  409  conflict (optimistic lock)
  410  gone (was here, now removed)
  415  unsupported media type
  422  validation error
  429  rate limited

5xx — Server error
  500  generic, don't know what
  502  bad gateway (upstream down)
  503  service unavailable (maintenance)
  504  gateway timeout (upstream slow)
```

## Recommended workflow

1. **For client code**: handle 401 differently from 403. Trigger retries on 5xx, not 4xx. Show validation errors from 422.
2. **For server code**: use the most specific status code that fits. Don't reach for 500 unless something is genuinely broken.
3. **For ad-hoc reference**: paste a number into [HTTP Status Codes](/web-tools/http-status-codes/) for the official meaning.
4. **For testing APIs**: [HTTP Request Builder](/web-tools/http-request-builder/) — send a request and inspect the actual status code returned.
5. **For documentation**: list expected status codes per endpoint. Don't make clients guess.

The summary, after years of debugging APIs: getting status codes right is one of those things that costs nothing once and saves hours later.

---

**Related tools on DevTools Online:**

- [HTTP Status Codes](/web-tools/http-status-codes/) — searchable reference for all codes
- [HTTP Request Builder](/web-tools/http-request-builder/) — test endpoints, see real status codes
- [HTTP Security Headers](/web-tools/http-headers-builder/) — pair with proper status codes for full HTTP hygiene
- [User-Agent Parser](/web-tools/user-agent-parser/) — for understanding which clients are seeing your responses
