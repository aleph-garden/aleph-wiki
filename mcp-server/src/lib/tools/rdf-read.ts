import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { readRdfResource } from '../solid-client.js';

/**
 * Input schema for rdf_read tool
 */
export const RdfReadInputSchema = z.object({
  url: z.string().url().describe('URL of the RDF resource to read'),
});

export type RdfReadInput = z.infer<typeof RdfReadInputSchema>;

/**
 * Tool definition for rdf_read
 */
export const rdfReadTool = {
  name: 'rdf_read',
  description: 'Read RDF resource from Solid Pod in Turtle format',
  inputSchema: zodToJsonSchema(RdfReadInputSchema),
};

/**
 * Handler for rdf_read tool
 *
 * @param params - Tool parameters validated against RdfReadInputSchema
 * @returns RDF content in Turtle format
 */
export async function handleRdfRead(params: RdfReadInput) {
  const content = await readRdfResource(params.url);
  return {
    content: [
      {
        type: 'text' as const,
        text: content,
      },
    ],
  };
}
