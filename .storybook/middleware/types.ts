import type { IncomingMessage, ServerResponse } from 'node:http';

export type StorybookStory = {
  id: string;
  title: string;
  name: string;
};

type StorybookIndexEntryBase = {
  id?: string;
  title?: string;
  name?: string;
  importPath?: string;
};

type LegacyStorybookIndexEntry = StorybookIndexEntryBase & {
  kind?: string;
  story?: string;
};

export type StorybookEntriesIndexEntry = StorybookIndexEntryBase & {
  type?: string;
  storiesImports?: string[];
  exportName?: string;
};

export type StorybookIndex = {
  stories?: Record<string, LegacyStorybookIndexEntry>;
  entries?: Record<string, StorybookEntriesIndexEntry>;
};

export type MiddlewareHandler = (
  req: IncomingMessage,
  res: ServerResponse,
) => void | Promise<void>;

export type MiddlewareApp = {
  get: (path: string, handler: MiddlewareHandler) => void;
  post: (path: string, handler: MiddlewareHandler) => void;
  delete: (path: string, handler: MiddlewareHandler) => void;
};
