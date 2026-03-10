import type { MiddlewareApp } from './middleware/types.ts';

import { registerMcpMiddleware } from './mcp/index.ts';

export default (app: MiddlewareApp): void => {
  registerMcpMiddleware(app);
};
