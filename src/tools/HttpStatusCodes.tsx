import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

interface StatusCode {
  code: number
  name: string
  description: string
  detail: string
  rfc: string
  rfcUrl: string
}

const STATUS_CODES: StatusCode[] = [
  // 1xx
  { code: 100, name: 'Continue', description: 'The server has received the request headers and the client should proceed.', detail: 'The client should continue with its request. This interim response is used to inform the client that the initial part of the request has been received and has not yet been rejected by the server.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.100' },
  { code: 101, name: 'Switching Protocols', description: 'The server is switching protocols as requested by the client.', detail: 'The server understands and is willing to comply with the client\'s request, via the Upgrade header field, for a change in the application protocol being used on this connection.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.101' },
  { code: 102, name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.', detail: 'An interim response to inform the client that the server has accepted the complete request but has not yet completed it. Defined in WebDAV.', rfc: 'RFC 2518', rfcUrl: 'https://tools.ietf.org/html/rfc2518' },
  { code: 103, name: 'Early Hints', description: 'Allows the user agent to start preloading resources while the server prepares a response.', detail: 'Used to return some response headers before final HTTP message. Useful for Link headers that indicate resources the client may start loading.', rfc: 'RFC 8297', rfcUrl: 'https://tools.ietf.org/html/rfc8297' },
  // 2xx
  { code: 200, name: 'OK', description: 'The request has succeeded.', detail: 'Standard response for successful HTTP requests. The actual response will depend on the request method used: GET returns resource, POST returns result of action.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.200' },
  { code: 201, name: 'Created', description: 'The request has been fulfilled, resulting in the creation of a new resource.', detail: 'The request has been fulfilled and has resulted in one or more new resources being created. The primary resource is identified by Location header or the request URI.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.201' },
  { code: 202, name: 'Accepted', description: 'The request has been accepted for processing, but the processing has not been completed.', detail: 'The request has been accepted for processing, but the processing has not been completed. Used for asynchronous processing scenarios.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.202' },
  { code: 203, name: 'Non-Authoritative Information', description: 'The server successfully processed the request, but is returning information from a third party.', detail: 'The request was successful but the returned meta-information in the entity-header is not the definitive set as available from the origin server.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.203' },
  { code: 204, name: 'No Content', description: 'The server successfully processed the request and is not returning any content.', detail: 'The server successfully processed the request, but is not returning any content. The response should not include a body. Common for DELETE requests.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.204' },
  { code: 205, name: 'Reset Content', description: 'The server successfully processed the request, but is not returning any content. Requires the requester to reset the document view.', detail: 'The server has fulfilled the request and the user agent should reset the document view which caused the request to be sent.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.205' },
  { code: 206, name: 'Partial Content', description: 'The server is delivering only part of the resource due to a Range header sent by the client.', detail: 'Used in response to a range request. The server sends the partial resource in the body, with Content-Range header describing the included portion.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.206' },
  { code: 207, name: 'Multi-Status', description: 'The message body contains an XML message with multiple response codes depending on how many sub-requests were made.', detail: 'Provides status for multiple independent operations. Defined in WebDAV (RFC 4918).', rfc: 'RFC 4918', rfcUrl: 'https://tools.ietf.org/html/rfc4918' },
  { code: 208, name: 'Already Reported', description: 'The members of a DAV binding have already been enumerated in a preceding part of the response.', detail: 'Used inside a DAV: propstat response element to avoid enumerating the internal members of multiple bindings to the same collection repeatedly.', rfc: 'RFC 5842', rfcUrl: 'https://tools.ietf.org/html/rfc5842' },
  { code: 226, name: 'IM Used', description: 'The server has fulfilled a GET request for the resource and the response is a representation of one or more instance-manipulations.', detail: 'The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.', rfc: 'RFC 3229', rfcUrl: 'https://tools.ietf.org/html/rfc3229' },
  // 3xx
  { code: 300, name: 'Multiple Choices', description: 'Indicates multiple options for the resource from which the client may choose.', detail: 'The requested resource corresponds to any one of a set of representations. The user agent can select a preferred representation and redirect to that location.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.300' },
  { code: 301, name: 'Moved Permanently', description: 'This and all future requests should be directed to the given URI.', detail: 'The requested resource has been assigned a new permanent URI and any future references to this resource should use one of the returned URIs.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.301' },
  { code: 302, name: 'Found', description: 'Tells the client to look at another URL. The URI may change in future requests.', detail: 'The target resource resides temporarily under a different URI. The user agent should continue to use the effective request URI for future requests.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.302' },
  { code: 303, name: 'See Other', description: 'The response to the request can be found under another URI using the GET method.', detail: 'The server is redirecting the user agent to a different resource. The new URI is not a substitute reference for the original resource.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.303' },
  { code: 304, name: 'Not Modified', description: 'Indicates that the resource has not been modified since the version specified by the request headers.', detail: 'Used for caching. The client already has a cached copy that is still valid. No need to retransmit the resource.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.304' },
  { code: 305, name: 'Use Proxy', description: 'The requested resource is available only through a proxy, the address for which is provided in the response.', detail: 'Deprecated. The requested resource must be accessed through the proxy given by the Location header.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.305' },
  { code: 307, name: 'Temporary Redirect', description: 'The request should be repeated with another URI; however, future requests should still use the original URI.', detail: 'The target resource resides temporarily under a different URI and the user agent must not change the request method if it performs a redirect.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.307' },
  { code: 308, name: 'Permanent Redirect', description: 'This and all future requests should be directed to the given URI. The request method must not change.', detail: 'The target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the given URIs. The request method must not change.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.308' },
  // 4xx
  { code: 400, name: 'Bad Request', description: 'The server cannot process the request due to a client error.', detail: 'The server cannot or will not process the request due to something that is perceived to be a client error (malformed request syntax, invalid request message framing, or deceptive request routing).', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.400' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.', detail: 'The request has not been applied because it lacks valid authentication credentials for the target resource. The response must include a WWW-Authenticate header field.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.401' },
  { code: 402, name: 'Payment Required', description: 'Reserved for future use. Originally intended for digital payment systems.', detail: 'Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micropayment scheme.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.402' },
  { code: 403, name: 'Forbidden', description: 'The client does not have access rights to the content.', detail: 'The server understood the request but refuses to authorize it. Unlike 401, re-authenticating will make no difference. Access is permanently forbidden.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.403' },
  { code: 404, name: 'Not Found', description: 'The server cannot find the requested resource.', detail: 'The origin server did not find a current representation for the target resource or is not willing to disclose that one exists. May be temporary or permanent.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.404' },
  { code: 405, name: 'Method Not Allowed', description: 'The request method is known by the server but is not supported by the target resource.', detail: 'The method received in the request-line is known by the origin server but not supported by the target resource. The origin server must generate an Allow header field.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.405' },
  { code: 406, name: 'Not Acceptable', description: 'The server cannot produce a response matching the list of acceptable values defined in the request\'s headers.', detail: 'The target resource does not have a current representation that would be acceptable to the user agent, and the server is unwilling to supply a default representation.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.406' },
  { code: 407, name: 'Proxy Authentication Required', description: 'The client must first authenticate itself with the proxy.', detail: 'Similar to 401, but the client must authenticate itself with the proxy. The proxy must return a Proxy-Authenticate header field.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.407' },
  { code: 408, name: 'Request Timeout', description: 'The server timed out waiting for the request.', detail: 'The server did not receive a complete request message within the time it was prepared to wait. The server may close the connection.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.408' },
  { code: 409, name: 'Conflict', description: 'The request conflicts with the current state of the server.', detail: 'The request could not be completed due to a conflict with the current state of the target resource. Common with PUT requests on version-controlled resources.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.409' },
  { code: 410, name: 'Gone', description: 'The resource requested is no longer available and will not be available again.', detail: 'The target resource is no longer available at the origin server and this condition is likely to be permanent. Clients with link editing capabilities should delete references.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.410' },
  { code: 411, name: 'Length Required', description: 'The request did not specify the length of its content.', detail: 'The server refuses to accept the request without a defined Content-Length header. The client may repeat the request if it adds a valid Content-Length header field.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.411' },
  { code: 412, name: 'Precondition Failed', description: 'The server does not meet one of the preconditions that the requester put on the request header fields.', detail: 'One or more conditions given in the request header fields evaluated to false when tested on the server.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.412' },
  { code: 413, name: 'Content Too Large', description: 'The request body is larger than the server is willing to process.', detail: 'The server refuses to process a request because the request payload is larger than the server is willing or able to process.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.413' },
  { code: 414, name: 'URI Too Long', description: 'The URI provided was too long for the server to process.', detail: 'The server refuses to service the request because the request-target is longer than the server is willing to interpret.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.414' },
  { code: 415, name: 'Unsupported Media Type', description: 'The request entity has a media type which the server or resource does not support.', detail: 'The origin server is refusing to service the request because the payload is in a format not supported by this method on the target resource.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.415' },
  { code: 416, name: 'Range Not Satisfiable', description: 'The client has asked for a portion of the file, but the server cannot supply that portion.', detail: 'None of the ranges in the request\'s Range header field overlap the current extent of the selected resource.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.416' },
  { code: 417, name: 'Expectation Failed', description: 'The server cannot meet the requirements of the Expect request-header field.', detail: 'The expectation given in the request\'s Expect header field could not be met by at least one of the inbound servers.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.417' },
  { code: 418, name: "I'm a Teapot", description: 'The server refuses the attempt to brew coffee with a teapot.', detail: 'Any attempt to brew coffee with a teapot should result in the error code 418 I\'m a teapot. Defined as an April Fools joke in RFC 2324.', rfc: 'RFC 2324', rfcUrl: 'https://tools.ietf.org/html/rfc2324' },
  { code: 421, name: 'Misdirected Request', description: 'The request was directed at a server that is not able to produce a response.', detail: 'The request was directed at a server that is not able to produce a response. Can be sent by a server that is not configured to produce responses for the combination of scheme and authority.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.421' },
  { code: 422, name: 'Unprocessable Content', description: 'The request was well-formed but was unable to be followed due to semantic errors.', detail: 'The server understands the content type of the request entity, and the syntax of the request entity is correct, but it was unable to process the contained instructions.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.422' },
  { code: 423, name: 'Locked', description: 'The resource that is being accessed is locked.', detail: 'The source or destination resource of a method is locked. Defined in WebDAV.', rfc: 'RFC 4918', rfcUrl: 'https://tools.ietf.org/html/rfc4918' },
  { code: 424, name: 'Failed Dependency', description: 'The request failed because it depended on another request and that request failed.', detail: 'The method could not be performed on the resource because the requested action depended on another action and that action failed.', rfc: 'RFC 4918', rfcUrl: 'https://tools.ietf.org/html/rfc4918' },
  { code: 425, name: 'Too Early', description: 'The server is unwilling to risk processing a request that might be replayed.', detail: 'Indicates that the server is unwilling to risk processing a request that might be replayed, which creates the potential for a replay attack.', rfc: 'RFC 8470', rfcUrl: 'https://tools.ietf.org/html/rfc8470' },
  { code: 426, name: 'Upgrade Required', description: 'The client should switch to a different protocol.', detail: 'The server refuses to perform the request using the current protocol but will be willing to do so after the client upgrades to a different protocol.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.426' },
  { code: 428, name: 'Precondition Required', description: 'The origin server requires the request to be conditional.', detail: 'The server requires the request to be conditional. Its purpose is to prevent the "lost update" problem, where a client GETs a resource\'s state, modifies it, and PUTs it back.', rfc: 'RFC 6585', rfcUrl: 'https://tools.ietf.org/html/rfc6585' },
  { code: 429, name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.', detail: 'The user has sent too many requests in a given amount of time ("rate limiting"). The response may include a Retry-After header indicating how long to wait.', rfc: 'RFC 6585', rfcUrl: 'https://tools.ietf.org/html/rfc6585' },
  { code: 431, name: 'Request Header Fields Too Large', description: 'The server refuses to process the request because the header fields are too large.', detail: 'The server is unwilling to process the request because its header fields are too large. Can apply to a single header or all headers collectively.', rfc: 'RFC 6585', rfcUrl: 'https://tools.ietf.org/html/rfc6585' },
  { code: 451, name: 'Unavailable For Legal Reasons', description: 'The user requests an illegal resource, such as a web page censored by a government.', detail: 'The server is denying access to the resource as a consequence of a legal demand. Named after the novel Fahrenheit 451 by Ray Bradbury.', rfc: 'RFC 7725', rfcUrl: 'https://tools.ietf.org/html/rfc7725' },
  // 5xx
  { code: 500, name: 'Internal Server Error', description: 'A generic error message given when no specific error message is suitable.', detail: 'The server encountered an unexpected condition that prevented it from fulfilling the request. A generic catch-all error.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.500' },
  { code: 501, name: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.', detail: 'The server does not support the functionality required to fulfill the request. This is the appropriate response when the server does not recognize the request method.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.501' },
  { code: 502, name: 'Bad Gateway', description: 'The server was acting as a gateway or proxy and received an invalid response from an upstream server.', detail: 'The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.502' },
  { code: 503, name: 'Service Unavailable', description: 'The server cannot handle the request (temporarily overloaded or down for maintenance).', detail: 'The server is currently unable to handle the request due to a temporary overload or scheduled maintenance. Retry-After header may indicate when the service will be available.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.503' },
  { code: 504, name: 'Gateway Timeout', description: 'The server was acting as a gateway or proxy and did not receive a timely response from an upstream server.', detail: 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server specified by the URI.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.504' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'The server does not support the HTTP protocol version used in the request.', detail: 'The server does not support, or refuses to support, the major version of HTTP that was used in the request message.', rfc: 'RFC 9110', rfcUrl: 'https://httpwg.org/specs/rfc9110.html#status.505' },
  { code: 506, name: 'Variant Also Negotiates', description: 'Transparent content negotiation results in a circular reference.', detail: 'The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself.', rfc: 'RFC 2295', rfcUrl: 'https://tools.ietf.org/html/rfc2295' },
  { code: 507, name: 'Insufficient Storage', description: 'The server is unable to store the representation needed to complete the request.', detail: 'The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.', rfc: 'RFC 4918', rfcUrl: 'https://tools.ietf.org/html/rfc4918' },
  { code: 508, name: 'Loop Detected', description: 'The server detected an infinite loop while processing the request.', detail: 'The server terminated an operation because it encountered an infinite loop while processing a request with "Depth: infinity". Defined in WebDAV.', rfc: 'RFC 5842', rfcUrl: 'https://tools.ietf.org/html/rfc5842' },
  { code: 510, name: 'Not Extended', description: 'Further extensions to the request are required for the server to fulfil it.', detail: 'The policy for accessing the resource has not been met in the request. The server should send back all the information necessary for the client to issue an extended request.', rfc: 'RFC 2774', rfcUrl: 'https://tools.ietf.org/html/rfc2774' },
  { code: 511, name: 'Network Authentication Required', description: 'The client needs to authenticate to gain network access.', detail: 'The client needs to authenticate to gain network access. Generated by intercepting proxies that control access to the network, not by the origin server.', rfc: 'RFC 6585', rfcUrl: 'https://tools.ietf.org/html/rfc6585' },
]

type Category = 'all' | '1xx' | '2xx' | '3xx' | '4xx' | '5xx'

const CATEGORY_COLORS: Record<string, string> = {
  '1': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  '2': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  '3': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  '4': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  '5': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

function getColor(code: number) {
  return CATEGORY_COLORS[String(code)[0]!] ?? 'bg-gray-100 text-gray-800'
}

function RowCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={e => { e.stopPropagation(); copy() }} className="btn-ghost text-xs py-0.5 px-2 flex items-center gap-1">
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function HttpStatusCodes() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [expanded, setExpanded] = useState<number | null>(null)

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: '1xx', label: '1xx Info' },
    { key: '2xx', label: '2xx Success' },
    { key: '3xx', label: '3xx Redirect' },
    { key: '4xx', label: '4xx Client' },
    { key: '5xx', label: '5xx Server' },
  ]

  const filtered = STATUS_CODES.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || String(s.code).includes(q) || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    const matchCat = category === 'all' || String(s.code).startsWith(category[0]!)
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search by code, name, or description..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="tool-textarea h-auto py-2"
      />

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === c.key ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} status code{filtered.length !== 1 ? 's' : ''}</p>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map(s => (
            <div key={s.code}>
              <button
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpanded(expanded === s.code ? null : s.code)}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono flex-shrink-0 mt-0.5 ${getColor(s.code)}`}>
                    {s.code}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{s.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{s.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RowCopyButton text={`${s.code} ${s.name}`} />
                    {expanded === s.code ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                  </div>
                </div>
              </button>
              {expanded === s.code && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">{s.detail}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <a
                      href={s.rfcUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={11} /> {s.rfc}
                    </a>
                    <RowCopyButton text={String(s.code)} />
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">No status codes match your search.</div>
          )}
        </div>
      </div>
    </div>
  )
}
