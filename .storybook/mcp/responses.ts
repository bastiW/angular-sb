import type { ServerResponse } from 'node:http';

import { sendJson } from '../middleware/http-response.ts';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown error while listing stories';

export const sendMethodNotAllowed = (res: ServerResponse): void => {
  res.setHeader('Allow', 'POST');

  sendJson(res, 405, {
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed.',
    },
    id: null,
  });
};

export const sendInternalError = (res: ServerResponse, error: unknown): void => {
  sendJson(res, 500, {
    jsonrpc: '2.0',
    error: {
      code: -32603,
      message: getErrorMessage(error),
    },
    id: null,
  });
};
