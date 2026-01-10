import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { initializeSolidSession } from '../solid-client.js';
import { ConfigSchema } from '../config.js';

/**
 * Input schema for solid_init tool
 */
export const SolidInitInputSchema = ConfigSchema.pick({
  podUrl: true,
  webId: true,
  clientId: true,
  clientSecret: true,
  oidcIssuer: true,
  sparqlEndpoint: true,
});

export type SolidInitInput = z.infer<typeof SolidInitInputSchema>;

/**
 * Tool definition for solid_init
 */
export const solidInitTool = {
  name: 'solid_init',
  description: 'Initialize Solid Pod session with authentication. Optionally configure a SPARQL endpoint for optimized queries.',
  inputSchema: zodToJsonSchema(SolidInitInputSchema),
};

/**
 * Handler for solid_init tool
 *
 * @param params - Tool parameters validated against SolidInitInputSchema
 * @returns Success message with Pod URL
 */
export async function handleSolidInit(params: SolidInitInput) {
  await initializeSolidSession(params);
  return {
    content: [
      {
        type: 'text' as const,
        text: `Initialized Solid session for ${params.webId} at ${params.podUrl}`,
      },
    ],
  };
}
