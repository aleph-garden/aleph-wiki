import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { registerTools, setSolidSession } from '../src/index.js';
import { createMockSession, mockFetchResponse, sampleTurtleData } from './mocks.js';

/**
 * Tests for sparql_query MCP tool
 *
 * This tool executes full SPARQL queries using Comunica QueryEngine
 * against Solid Pod resources with authenticated session.fetch
 */
describe('sparql_query MCP tool', () => {
  let server: Server;
  let listToolsHandler: any;
  let callToolHandler: any;
  let mockSession: any;

  // Common setup for all tests
  beforeEach(() => {
    // Create fresh MCP server
    server = new Server(
      {
        name: 'aleph-wiki-solid',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Capture the handlers that registerTools sets
    listToolsHandler = null;
    callToolHandler = null;
    const originalSetRequestHandler = server.setRequestHandler.bind(server);
    server.setRequestHandler = ((schema: any, handler: any) => {
      if (schema === ListToolsRequestSchema) {
        listToolsHandler = handler;
      } else if (schema === CallToolRequestSchema) {
        callToolHandler = handler;
      }
      return originalSetRequestHandler(schema, handler);
    }) as any;

    // Register tools
    registerTools(server);

    // Create mock session
    mockSession = createMockSession();
    setSolidSession(mockSession as any);
  });

  describe('tool registration', () => {
    it('registers sparql_query tool with correct name', async () => {
      const listResponse = await listToolsHandler();
      const sparqlQueryTool = listResponse.tools.find((t: any) => t.name === 'sparql_query');

      expect(sparqlQueryTool).toBeDefined();
      expect(sparqlQueryTool.name).toBe('sparql_query');
    });

    it('has description for SPARQL query execution', async () => {
      const listResponse = await listToolsHandler();
      const sparqlQueryTool = listResponse.tools.find((t: any) => t.name === 'sparql_query');

      expect(sparqlQueryTool.description).toBeDefined();
      expect(sparqlQueryTool.description).toContain('SPARQL');
    });
  });

  describe('tool schema', () => {
    it('has url parameter in schema', async () => {
      const listResponse = await listToolsHandler();
      const sparqlQueryTool = listResponse.tools.find((t: any) => t.name === 'sparql_query');

      expect(sparqlQueryTool.inputSchema.properties).toHaveProperty('url');
      expect(sparqlQueryTool.inputSchema.properties.url.type).toBe('string');
    });

    it('has query parameter in schema', async () => {
      const listResponse = await listToolsHandler();
      const sparqlQueryTool = listResponse.tools.find((t: any) => t.name === 'sparql_query');

      expect(sparqlQueryTool.inputSchema.properties).toHaveProperty('query');
      expect(sparqlQueryTool.inputSchema.properties.query.type).toBe('string');
    });

    it('requires both url and query parameters', async () => {
      const listResponse = await listToolsHandler();
      const sparqlQueryTool = listResponse.tools.find((t: any) => t.name === 'sparql_query');

      expect(sparqlQueryTool.inputSchema.required).toContain('url');
      expect(sparqlQueryTool.inputSchema.required).toContain('query');
    });
  });

  describe('SELECT query execution', () => {
    it('executes SELECT query and returns JSON results', async () => {
      // Mock fetch to return sample RDF data
      mockSession.fetch.mockReturnValue(
        mockFetchResponse(sampleTurtleData, 200, 'text/turtle')
      );

      const selectQuery = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        SELECT ?concept ?label
        WHERE {
          ?concept a skos:Concept ;
                   skos:prefLabel ?label .
        }
      `;

      const callResponse = await callToolHandler({
        params: {
          name: 'sparql_query',
          arguments: {
            url: 'https://test.solidcommunity.net/aleph-wiki.ttl',
            query: selectQuery,
          },
        },
      });

      // Verify response structure
      expect(callResponse.content).toBeDefined();
      expect(callResponse.content[0].type).toBe('text');

      // Parse the JSON result
      const result = JSON.parse(callResponse.content[0].text);

      // Verify SPARQL JSON results format
      expect(result).toHaveProperty('head');
      expect(result).toHaveProperty('results');
      expect(result.head).toHaveProperty('vars');
      expect(result.head.vars).toContain('concept');
      expect(result.head.vars).toContain('label');
      expect(result.results).toHaveProperty('bindings');
      expect(Array.isArray(result.results.bindings)).toBe(true);
    });

    it('returns bindings with correct values from RDF data', async () => {
      mockSession.fetch.mockReturnValue(
        mockFetchResponse(sampleTurtleData, 200, 'text/turtle')
      );

      const selectQuery = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        SELECT ?label
        WHERE {
          <http://aleph-wiki.local/concept/test-concept> skos:prefLabel ?label .
        }
      `;

      const callResponse = await callToolHandler({
        params: {
          name: 'sparql_query',
          arguments: {
            url: 'https://test.solidcommunity.net/aleph-wiki.ttl',
            query: selectQuery,
          },
        },
      });

      const result = JSON.parse(callResponse.content[0].text);
      expect(result.results.bindings.length).toBeGreaterThan(0);
      expect(result.results.bindings[0]).toHaveProperty('label');
      expect(result.results.bindings[0].label.value).toBe('Test Concept');
    });
  });

  describe('CONSTRUCT query execution', () => {
    it('executes CONSTRUCT query and returns RDF triples', async () => {
      mockSession.fetch.mockReturnValue(
        mockFetchResponse(sampleTurtleData, 200, 'text/turtle')
      );

      const constructQuery = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        CONSTRUCT {
          ?concept skos:prefLabel ?label .
        }
        WHERE {
          ?concept a skos:Concept ;
                   skos:prefLabel ?label .
        }
      `;

      const callResponse = await callToolHandler({
        params: {
          name: 'sparql_query',
          arguments: {
            url: 'https://test.solidcommunity.net/aleph-wiki.ttl',
            query: constructQuery,
          },
        },
      });

      // Verify response contains RDF triples
      expect(callResponse.content).toBeDefined();
      expect(callResponse.content[0].type).toBe('text');

      // CONSTRUCT should return Turtle/N-Triples format
      const rdfOutput = callResponse.content[0].text;
      expect(rdfOutput).toContain('skos:prefLabel');
      expect(rdfOutput).toContain('Test Concept');
    });

    it('returns valid Turtle format from CONSTRUCT query', async () => {
      mockSession.fetch.mockReturnValue(
        mockFetchResponse(sampleTurtleData, 200, 'text/turtle')
      );

      const constructQuery = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX : <http://aleph-wiki.local/concept/>
        CONSTRUCT {
          :test-concept skos:prefLabel ?label .
        }
        WHERE {
          :test-concept skos:prefLabel ?label .
        }
      `;

      const callResponse = await callToolHandler({
        params: {
          name: 'sparql_query',
          arguments: {
            url: 'https://test.solidcommunity.net/aleph-wiki.ttl',
            query: constructQuery,
          },
        },
      });

      const rdfOutput = callResponse.content[0].text;

      // Should contain valid triple components
      expect(rdfOutput).toContain('test-concept');
      expect(rdfOutput).toContain('prefLabel');
    });
  });

  describe('ASK query execution', () => {
    it('executes ASK query and returns boolean result', async () => {
      mockSession.fetch.mockReturnValue(
        mockFetchResponse(sampleTurtleData, 200, 'text/turtle')
      );

      const askQuery = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        ASK {
          ?concept a skos:Concept .
        }
      `;

      const callResponse = await callToolHandler({
        params: {
          name: 'sparql_query',
          arguments: {
            url: 'https://test.solidcommunity.net/aleph-wiki.ttl',
            query: askQuery,
          },
        },
      });

      expect(callResponse.content).toBeDefined();
      expect(callResponse.content[0].type).toBe('text');

      // ASK queries return boolean in SPARQL JSON format
      const result = JSON.parse(callResponse.content[0].text);
      expect(result).toHaveProperty('boolean');
      expect(typeof result.boolean).toBe('boolean');
      expect(result.boolean).toBe(true);
    });

    it('returns false for non-matching ASK query', async () => {
      mockSession.fetch.mockReturnValue(
        mockFetchResponse(sampleTurtleData, 200, 'text/turtle')
      );

      const askQuery = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        ASK {
          ?concept a skos:NonExistentClass .
        }
      `;

      const callResponse = await callToolHandler({
        params: {
          name: 'sparql_query',
          arguments: {
            url: 'https://test.solidcommunity.net/aleph-wiki.ttl',
            query: askQuery,
          },
        },
      });

      const result = JSON.parse(callResponse.content[0].text);
      expect(result.boolean).toBe(false);
    });
  });

  describe('authenticated fetch usage', () => {
    it('uses session.fetch for authenticated requests', async () => {
      mockSession.fetch.mockReturnValue(
        mockFetchResponse(sampleTurtleData, 200, 'text/turtle')
      );

      const selectQuery = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        SELECT * WHERE { ?s ?p ?o } LIMIT 1
      `;

      await callToolHandler({
        params: {
          name: 'sparql_query',
          arguments: {
            url: 'https://test.solidcommunity.net/private/data.ttl',
            query: selectQuery,
          },
        },
      });

      // Verify session.fetch was called (Comunica uses it internally)
      expect(mockSession.fetch).toHaveBeenCalled();
    });
  });
});
