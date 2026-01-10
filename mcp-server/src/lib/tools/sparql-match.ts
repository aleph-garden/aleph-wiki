import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { sparqlMatch } from '../sparql.js';

/**
 * Input schema for sparql_match tool
 */
export const SparqlMatchInputSchema = z.object({
  url: z.string().url().describe('URL of the RDF resource to query'),
  subject: z.string().nullable().optional().describe('Subject URI or null for wildcard'),
  predicate: z.string().nullable().optional().describe('Predicate URI or null for wildcard'),
  object: z.string().nullable().optional().describe('Object URI/literal or null for wildcard'),
});

export type SparqlMatchInput = z.infer<typeof SparqlMatchInputSchema>;

/**
 * Tool definition for sparql_match
 */
export const sparqlMatchTool = {
  name: 'sparql_match',
  description: 'Execute simple triple pattern matching with wildcards',
  inputSchema: zodToJsonSchema(SparqlMatchInputSchema),
};

/**
 * Handler for sparql_match tool
 *
 * @param params - Tool parameters validated against SparqlMatchInputSchema
 * @returns Matched triples as JSON
 */
export async function handleSparqlMatch(params: SparqlMatchInput) {
  const results = await sparqlMatch(
    params.url,
    params.subject,
    params.predicate,
    params.object
  );

  const resultText =
    results.length === 0
      ? `No matches found (0 triples)`
      : JSON.stringify(results, null, 2);

  return {
    content: [
      {
        type: 'text' as const,
        text: resultText,
      },
    ],
  };
}
