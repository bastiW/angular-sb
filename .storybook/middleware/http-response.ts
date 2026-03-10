import type { ServerResponse } from 'node:http';

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

export const sendJson = (res: ServerResponse, statusCode: number, body: unknown): void => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', JSON_CONTENT_TYPE);
  res.end(JSON.stringify(body, null, 2));
};
