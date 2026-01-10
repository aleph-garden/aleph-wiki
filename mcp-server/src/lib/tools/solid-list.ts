import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { listContainer } from '../solid-client.js';

/**
 * Input schema for solid_list tool
 */
export const SolidListInputSchema = z.object({
  containerUrl: z
    .string()
    .url()
    .describe('URL of the Solid container (must end with /)')
    .refine((url) => url.endsWith('/'), {
      message: 'Container URL must end with /',
    }),
});

export type SolidListInput = z.infer<typeof SolidListInputSchema>;

/**
 * Tool definition for solid_list
 */
export const solidListTool = {
  name: 'solid_list',
  description: 'List resources in a Solid container',
  inputSchema: zodToJsonSchema(SolidListInputSchema),
};

/**
 * Handler for solid_list tool
 *
 * @param params - Tool parameters validated against SolidListInputSchema
 * @returns Array of resource URLs in the container
 */
export async function handleSolidList(params: SolidListInput) {
  const resources = await listContainer(params.containerUrl);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(resources, null, 2),
      },
    ],
  };
}
