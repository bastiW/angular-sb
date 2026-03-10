import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerComponentDocumentationTool } from './component-documentation.ts';
import { registerListComponentsTool } from './list-components.ts';

export const registerTools = (server: McpServer): void => {
  registerListComponentsTool(server);
  registerComponentDocumentationTool(server);
};
