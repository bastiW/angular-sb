import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { StorybookEntriesIndexEntry, StorybookIndex } from '../../middleware/types.ts';
import { fetchIndex, STORYBOOK_INDEX_PATH } from '../../middleware/fetch-index.ts';

import { DEFAULT_STORYBOOK_HOST } from '../constants.ts';

export type StoryReference = {
  id: string;
  name: string;
  variants: string[];
};

export type StoryDocumentation = {
  id: string;
  name: string;
  content: string;
};

const getHost = (hostHeader: string | undefined): string => hostHeader ?? DEFAULT_STORYBOOK_HOST;

const sortByTitle = (a: StorybookEntriesIndexEntry, b: StorybookEntriesIndexEntry): number =>
  (a.title ?? '').localeCompare(b.title ?? '');

export const getDocsEntries = (index: StorybookIndex): StorybookEntriesIndexEntry[] =>
  Object.values(index.entries ?? {})
    .filter((entry) => entry.type === 'docs' && Boolean(entry.id) && Boolean(entry.title))
    .sort(sortByTitle);

const getStoryEntries = (index: StorybookIndex): StorybookEntriesIndexEntry[] =>
  Object.values(index.entries ?? {}).filter((entry) => entry.type === 'story');

const getImportPathCandidates = (importPath: string): string[] => {
  const relativeImportPath = importPath.replace(/^\.\//, '');

  return [
    path.resolve(process.cwd(), relativeImportPath),
    path.resolve(process.cwd(), '..', relativeImportPath),
  ];
};

export const readStorySource = async (importPath: string): Promise<string> => {
  let lastError: unknown;

  for (const candidatePath of getImportPathCandidates(importPath)) {
    try {
      return await readFile(candidatePath, 'utf8');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

const fetchStorybookIndex = async (hostHeader: string | undefined): Promise<StorybookIndex> => {
  const indexResponse = await fetchIndex(getHost(hostHeader));

  if (indexResponse.ok === false) {
    throw new Error(`Failed to read ${STORYBOOK_INDEX_PATH} (${indexResponse.status})`);
  }

  return indexResponse.index;
};

const extractCanvasExportName = (expression: string): string | null => {
  const match = expression.trim().match(/([A-Za-z_$][\w$]*)\s*$/);

  return match?.[1] ?? null;
};

const extractCanvasLabel = (attributes: string): string | null => {
  const expressionLabel =
    attributes.match(/\blabel=\{(["'])(.*?)\1\}/s)?.[2] ??
    attributes.match(/\blabel=(["'])(.*?)\1/s)?.[2];

  return expressionLabel?.trim() || null;
};

const extractVariantNames = (
  storySource: string,
  storyEntriesByExportName: Map<string, StorybookEntriesIndexEntry>,
): string[] => {
  const variants: string[] = [];
  const canvasPattern = /<(?:Canvas|[A-Z][\w$]*Canvas)\b([^>]*)\/?>/g;

  for (const match of storySource.matchAll(canvasPattern)) {
    const attributes = match[1];
    const storyReference = attributes.match(/\bof=\{([^}]+)\}/)?.[1];

    if (!storyReference) {
      continue;
    }

    const exportName = extractCanvasExportName(storyReference);

    if (!exportName) {
      continue;
    }

    const label = extractCanvasLabel(attributes);
    const variantName = label ?? storyEntriesByExportName.get(exportName)?.name ?? exportName;

    variants.push(variantName);
  }

  return variants;
};

const buildStoryEntriesByExportName = (
  docsEntry: StorybookEntriesIndexEntry,
  allStoryEntries: StorybookEntriesIndexEntry[],
): Map<string, StorybookEntriesIndexEntry> => {
  const allowedImportPaths = new Set(docsEntry.storiesImports ?? []);

  return new Map(
    allStoryEntries
      .filter(
        (
          entry,
        ): entry is StorybookEntriesIndexEntry & { exportName: string; importPath: string } => {
          if (!entry.exportName || !entry.importPath) {
            return false;
          }

          return allowedImportPaths.has(entry.importPath);
        },
      )
      .map((entry) => [entry.exportName!, entry]),
  );
};

export const listStories = async (hostHeader: string | undefined): Promise<StoryReference[]> => {
  const index = await fetchStorybookIndex(hostHeader);
  const docsEntries = getDocsEntries(index);
  const storyEntries = getStoryEntries(index);

  const stories = await Promise.all(
    docsEntries.map(async (docsEntry) => {
      const storySource = docsEntry.importPath ? await readStorySource(docsEntry.importPath) : '';
      const storyEntriesByExportName = buildStoryEntriesByExportName(docsEntry, storyEntries);

      return {
        id: docsEntry.id!,
        name: docsEntry.title!,
        variants: extractVariantNames(storySource, storyEntriesByExportName),
      };
    }),
  );

  if (stories.length === 0) {
    throw new Error(`No stories found in ${STORYBOOK_INDEX_PATH}`);
  }

  return stories;
};

export const getStoryDocumentation = async (
  hostHeader: string | undefined,
  id: string,
): Promise<StoryDocumentation> => {
  const index = await fetchStorybookIndex(hostHeader);
  const docsEntry = getDocsEntries(index).find((entry) => entry.id === id);

  if (!docsEntry) {
    throw new Error(`No documentation found for component id "${id}"`);
  }

  if (!docsEntry.importPath) {
    throw new Error(`Documentation entry "${id}" does not include an import path`);
  }

  return {
    id: docsEntry.id!,
    name: docsEntry.title!,
    content: await readStorySource(docsEntry.importPath),
  };
};
