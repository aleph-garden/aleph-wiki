import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { appendTriples } from '../solid-client.js';

/**
 * Input schema for rdf_append tool
 */
export const RdfAppendInputSchema = z.object({
  url: z.string().url().describe('URL of the RDF resource to modify'),
  triples: z.string().describe('Turtle-formatted triples to append'),
});

export type RdfAppendInput = z.infer<typeof RdfAppendInputSchema>;

/**
 * Tool definition for rdf_append
 */
export const rdfAppendTool = {
  name: 'rdf_append',
  description: 'Append RDF triples to a resource using SPARQL UPDATE',
  inputSchema: zodToJsonSchema(RdfAppendInputSchema),
};

/**
 * Handler for rdf_append tool
 *
 * @param params - Tool parameters validated against RdfAppendInputSchema
 * @returns Success message
 */
export async function handleRdfAppend(params: RdfAppendInput) {
  await appendTriples(params.url, params.triples);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Successfully appended triples to ${params.url}`,
      },
    ],
  };
}
