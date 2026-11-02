import { describe, it, expect } from 'vitest';
import { routeSessionRequest } from './session-routing.js';

describe('routeSessionRequest', () => {
  it('reuses a known session', () => {
    expect(routeSessionRequest('POST', 'abc', true, false)).toBe('existing');
  });

  it('starts a session on initialize, even when a stale session id is sent', () => {
    expect(routeSessionRequest('POST', undefined, false, true)).toBe('initialize');
    expect(routeSessionRequest('POST', 'stale', false, true)).toBe('initialize');
  });

  it('serves a POST with an unknown session statelessly (server restarted after idling)', () => {
    expect(routeSessionRequest('POST', 'stale', false, false)).toBe('stateless');
    expect(routeSessionRequest('POST', undefined, false, false)).toBe('stateless');
  });

  it('answers 404 for a non-POST naming an unknown session, and 400 without one', () => {
    expect(routeSessionRequest('GET', 'stale', false, false)).toBe('not-found');
    expect(routeSessionRequest('DELETE', undefined, false, false)).toBe('bad-request');
  });
});
