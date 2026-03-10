import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import type { MiddlewareHandler } from '../middleware/types.ts';

import { sendInternalError } from './responses.ts';
import { createMcpServer } from './server.ts';

export const createMcpHandler = (): MiddlewareHandler => {
  return async (req, res): Promise<void> => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    const server = createMcpServer();

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      if (!res.headersSent) {
        sendInternalError(res, error);
      }
    } finally {
      await transport.close();
      await server.close();
    }
  };
};
