import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { executeSparqlQuery } from '../sparql.js';

/**
 * Input schema for sparql_query tool
 */
export const SparqlQueryInputSchema = z.object({
  url: z.string().url().describe('URL of the RDF resource to query'),
  query: z.string().describe('SPARQL query string (SELECT, CONSTRUCT, or ASK)'),
});

export type SparqlQueryInput = z.infer<typeof SparqlQueryInputSchema>;

/**
 * Tool definition for sparql_query
 */
export const sparqlQueryTool = {
  name: 'sparql_query',
  description: 'Execute SPARQL query (SELECT, CONSTRUCT, ASK) against a Solid Pod resource using Comunica',
  inputSchema: zodToJsonSchema(SparqlQueryInputSchema),
};

/**
 * Handler for sparql_query tool
 *
 * @param params - Tool parameters validated against SparqlQueryInputSchema
 * @returns Query results formatted based on query type
 */
export async function handleSparqlQuery(params: SparqlQueryInput) {
  const results = await executeSparqlQuery(params.url, params.query);
  return {
    content: [
      {
        type: 'text' as const,
        text: results,
      },
    ],
  };
}
