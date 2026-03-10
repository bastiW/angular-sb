import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from './tools/index.ts';

export const createMcpServer = (): McpServer => {
  const server = new McpServer(
    {
      name: 'UI Components',
      version: '1.0.0',
    },
    {
      capabilities: {},
    },
  );

  registerTools(server);

  return server;
};
