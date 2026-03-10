import type { MiddlewareApp } from '../middleware/types.ts';

import { MCP_ROUTE } from './constants.ts';
import { createMcpHandler } from './handler.ts';
import { sendMethodNotAllowed } from './responses.ts';

export const registerMcpMiddleware = (app: MiddlewareApp): void => {
  app.post(MCP_ROUTE, createMcpHandler());
  app.get(MCP_ROUTE, (_req, res) => {
    sendMethodNotAllowed(res);
  });
  app.delete(MCP_ROUTE, (_req, res) => {
    sendMethodNotAllowed(res);
  });
};
