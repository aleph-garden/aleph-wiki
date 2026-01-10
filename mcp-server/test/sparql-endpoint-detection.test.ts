import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeSparqlQuery } from '../src/lib/sparql.js';
import { setSolidSession, initializeSolidSession } from '../src/index.js';
import { createMockSession, mockFetchResponse } from './mocks.js';

/**
 * Tests for SPARQL endpoint configuration
 *
 * The abstraction should:
 * - Use a configured SPARQL endpoint when provided during solid_init
 * - Send queries directly to the endpoint (fast path) when configured
 * - Fall back to Comunica over HTTP when no endpoint is configured
 */
describe('SPARQL endpoint configuration', () => {
  let mockSession: any;

  beforeEach(() => {
    mockSession = createMockSession();
  });

  it('uses configured SPARQL endpoint when provided', async () => {
    const endpointUrl = 'https://test.solidcommunity.net/sparql';

    // Initialize session with a configured SPARQL endpoint (stores config)
    await initializeSolidSession({
      podUrl: 'https://test.solidcommunity.net/',
      webId: 'https://test.solidcommunity.net/profile/card#me',
      oidcIssuer: 'https://solidcommunity.net',
      sparqlEndpoint: endpointUrl,
    });

    // Replace the real session with mock (config is already stored)
    setSolidSession(mockSession as any);

    // Mock the SPARQL query response
    mockSession.fetch.mockReturnValueOnce(
      mockFetchResponse(JSON.stringify({
        head: { vars: ['s'] },
        results: {
          bindings: [
            { s: { type: 'uri', value: 'http://example.org/test' } }
          ]
        }
      }), 200, 'application/sparql-results+json')
    );

    const query = 'SELECT ?s WHERE { ?s ?p ?o } LIMIT 1';
    const result = await executeSparqlQuery('https://test.solidcommunity.net/data.ttl', query);

    // Verify the endpoint was used (1 fetch call directly to endpoint)
    expect(mockSession.fetch).toHaveBeenCalledTimes(1);

    // Verify the call was to the configured SPARQL endpoint URL
    const call = mockSession.fetch.mock.calls[0];
    expect(call[0]).toBe(endpointUrl);
    expect(call[1].method).toBe('POST');
    expect(call[1].headers['Content-Type']).toBe('application/sparql-query');
    expect(call[1].body).toBe(query);

    // Result should be valid SPARQL JSON
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('head');
    expect(parsed).toHaveProperty('results');
  });
});
