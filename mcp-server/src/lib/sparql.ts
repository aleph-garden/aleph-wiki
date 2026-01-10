import { Parser, Store } from 'n3';
import { QueryEngine } from '@comunica/query-sparql';
import { getSolidSession, readRdfResource } from './solid-client.js';

// Create a singleton QueryEngine instance
let queryEngine: QueryEngine | null = null;

/**
 * Get or create the singleton Comunica QueryEngine instance
 *
 * @returns The QueryEngine instance for executing SPARQL queries
 */
function getQueryEngine(): QueryEngine {
  if (!queryEngine) {
    queryEngine = new QueryEngine();
  }
  return queryEngine;
}

/**
 * Match RDF triples using pattern matching
 *
 * Performs simple triple pattern matching on an RDF resource using N3.js Store.
 * Null or undefined parameters act as wildcards matching any value.
 *
 * @param url - The URL of the RDF resource to query
 * @param subject - Subject URI to match, or null/undefined for wildcard
 * @param predicate - Predicate URI to match, or null/undefined for wildcard
 * @param object - Object URI/literal to match, or null/undefined for wildcard
 * @returns Promise resolving to array of matched triples
 * @throws {Error} If session is not initialized or resource fetch fails
 *
 * @example
 * ```ts
 * // Find all SKOS Concepts
 * const concepts = await sparqlMatch(
 *   'https://example.com/data.ttl',
 *   null,
 *   'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
 *   'http://www.w3.org/2004/02/skos/core#Concept'
 * );
 * ```
 */
export async function sparqlMatch(
  url: string,
  subject?: string | null,
  predicate?: string | null,
  object?: string | null
): Promise<Array<{ subject: string; predicate: string; object: string }>> {
  // Read RDF resource
  const rdfContent = await readRdfResource(url);

  // Parse Turtle with N3.js
  const parser = new Parser();
  const store = new Store();
  const quads = parser.parse(rdfContent);
  store.addQuads(quads);

  // Use store.getQuads() for pattern matching (null = wildcard)
  const matches = store.getQuads(
    subject || null,
    predicate || null,
    object || null,
    null
  );

  // Convert quads to JSON array
  return matches.map((quad) => ({
    subject: quad.subject.value,
    predicate: quad.predicate.value,
    object: quad.object.value,
  }));
}

/**
 * Execute a full SPARQL query using Comunica QueryEngine
 *
 * Supports SELECT, CONSTRUCT, and ASK query types with automatic result formatting:
 * - SELECT: Returns SPARQL JSON results format
 * - CONSTRUCT: Returns Turtle format with common prefixes
 * - ASK: Returns JSON with boolean result
 *
 * @param url - The URL of the RDF resource to query
 * @param query - The SPARQL query string
 * @returns Promise resolving to formatted query results
 * @throws {Error} If session is not initialized
 * @throws {Error} If query execution fails
 *
 * @example
 * ```ts
 * // SELECT query
 * const results = await executeSparqlQuery(
 *   'https://example.com/data.ttl',
 *   'SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10'
 * );
 *
 * // ASK query
 * const exists = await executeSparqlQuery(
 *   'https://example.com/data.ttl',
 *   'ASK { ?s a <http://example.org/Type> }'
 * );
 * ```
 */
export async function executeSparqlQuery(url: string, query: string): Promise<string> {
  const session = getSolidSession();
  if (!session) {
    throw new Error('Solid session not initialized');
  }

  const engine = getQueryEngine();

  // Execute query with authenticated fetch
  const result = await engine.query(query, {
    sources: [url],
    fetch: session.fetch,
    httpCacheDisabled: true,
  });

  // Detect query type and format output accordingly
  if (result.resultType === 'bindings') {
    // SELECT query - return SPARQL JSON results
    const bindingsStream = await result.execute();
    const bindingsArray = await bindingsStream.toArray();

    const vars = bindingsArray.length > 0
      ? Array.from(bindingsArray[0].keys()).map((key: any) => key.value)
      : [];

    return JSON.stringify({
      head: { vars },
      results: {
        bindings: bindingsArray.map((binding) => {
          const obj: any = {};
          binding.forEach((value, key) => {
            obj[key.value] = {
              type: value.termType === 'NamedNode' ? 'uri' : 'literal',
              value: value.value,
              ...(value.language && { 'xml:lang': value.language }),
            };
          });
          return obj;
        }),
      },
    });
  } else if (result.resultType === 'quads') {
    // CONSTRUCT query - return Turtle format
    const quadsStream = await result.execute();
    const quadsArray = await quadsStream.toArray();

    // Convert quads to Turtle format
    const store = new Store(quadsArray);
    const { Writer } = await import('n3');
    const writer = new Writer({
      format: 'text/turtle',
      prefixes: {
        skos: 'http://www.w3.org/2004/02/skos/core#',
        schema: 'http://schema.org/',
      },
    });

    return new Promise((resolve, reject) => {
      writer.addQuads(store.getQuads(null, null, null, null));
      writer.end((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  } else if (result.resultType === 'boolean') {
    // ASK query - return boolean JSON
    const booleanResult = await result.execute();
    return JSON.stringify({ boolean: booleanResult });
  }

  throw new Error(`Unsupported query result type: ${result.resultType}`);
}
