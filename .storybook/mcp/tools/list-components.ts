import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';

import { listStories } from '../helpers/list-stories.ts';
import { getHeaderValue } from '../request-headers.ts';

const STORY_REFERENCE_SCHEMA = z.object({
  id: z.string(),
  name: z.string(),
  variants: z.array(z.string()),
});

export const registerListComponentsTool = (server: McpServer): void => {
  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description: 'List the available components with id, name, and story variants.',
      inputSchema: {},
      outputSchema: {
        components: z.array(STORY_REFERENCE_SCHEMA),
      },
    },
    async (_args, extra) => {
      const components = await listStories(getHeaderValue(extra.requestInfo?.headers['host']));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ components }, null, 2),
          },
        ],
        structuredContent: {
          components,
        },
      };
    },
  );
};
