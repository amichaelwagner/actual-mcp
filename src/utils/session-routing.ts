/**
 * How the Streamable HTTP endpoint should handle a request, given what we know about its session.
 *
 * - `existing`: the session id is known — reuse its transport.
 * - `initialize`: an initialize request — start a new stateful session.
 * - `stateless`: a POST that is not an initialize request and whose session id is missing or unknown.
 *   Reason: free-tier hosts (e.g. Render) restart the process after idling, which wipes the in-memory
 *   session map. Clients such as claude.ai keep sending the old session id and do not re-initialize,
 *   so every call would fail with "No valid session ID". Serving the request on a one-shot stateless
 *   transport keeps the connector working across restarts.
 * - `not-found`: any other request naming an unknown session — answer 404 so spec-compliant clients
 *   start a new session (MCP Streamable HTTP: unknown session ids MUST get 404).
 * - `bad-request`: anything else (e.g. a GET/DELETE with no session id).
 */
export type SessionRoute = 'existing' | 'initialize' | 'stateless' | 'not-found' | 'bad-request';

/**
 * Decides how to route a Streamable HTTP request.
 *
 * @param method - HTTP method of the request
 * @param sessionHeader - Value of the `mcp-session-id` header, if any
 * @param sessionKnown - Whether that session id is in the server's session map
 * @param isInitialize - Whether the body is an MCP initialize request
 * @returns The route to take
 */
export function routeSessionRequest(
  method: string,
  sessionHeader: string | undefined,
  sessionKnown: boolean,
  isInitialize: boolean
): SessionRoute {
  if (sessionHeader && sessionKnown) return 'existing';
  if (method === 'POST' && isInitialize) return 'initialize';
  if (method === 'POST') return 'stateless';
  if (sessionHeader) return 'not-found';
  return 'bad-request';
}
