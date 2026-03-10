import { access, readFile } from 'node:fs/promises';
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
  sourceBlocksByExportName: Record<string, string>;
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

const resolveImportPath = async (importPath: string): Promise<string> => {
  for (const candidatePath of getImportPathCandidates(importPath)) {
    try {
      await access(candidatePath);
      return candidatePath;
    } catch {}
  }

  throw new Error(`Unable to resolve import path "${importPath}"`);
};

export const readStorySource = async (importPath: string): Promise<string> => {
  const resolvedImportPath = await resolveImportPath(importPath);

  return readFile(resolvedImportPath, 'utf8');
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

const stripLoaders = (importSpecifier: string): string =>
  importSpecifier.split('!').at(-1) ?? importSpecifier;

const resolveImportedFilePath = (storyFilePath: string, importSpecifier: string): string => {
  const filePath = stripLoaders(importSpecifier);

  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(path.dirname(storyFilePath), filePath);
};

const readImportedFile = async (
  storyFilePath: string,
  importSpecifier: string,
): Promise<{ path: string; source: string }> => {
  const importedFilePath = resolveImportedFilePath(storyFilePath, importSpecifier);

  return {
    path: importedFilePath,
    source: await readFile(importedFilePath, 'utf8'),
  };
};

const createCodeFence = (fileName: string, language: string, source: string): string =>
  ['```' + language + ' title="' + fileName + '"', source.trimEnd(), '```'].join('\n');

const buildImportMap = (storySource: string): Map<string, string> => {
  const importMap = new Map<string, string>();
  const importPattern =
    /import\s+(?:type\s+)?([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+)['"];?/g;

  for (const match of storySource.matchAll(importPattern)) {
    importMap.set(match[1], match[2]);
  }

  return importMap;
};

const findMatchingToken = (
  source: string,
  startIndex: number,
  openToken: string,
  closeToken: string,
): number => {
  let depth = 0;
  let quote: '"' | "'" | '`' | null = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (current === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (current === '*' && next === '/') {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (current === '\\') {
        index += 1;
        continue;
      }

      if (current === quote) {
        quote = null;
      }
      continue;
    }

    if (current === '/' && next === '/') {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (current === '/' && next === '*') {
      inBlockComment = true;
      index += 1;
      continue;
    }

    if (current === '"' || current === "'" || current === '`') {
      quote = current;
      continue;
    }

    if (current === openToken) {
      depth += 1;
      continue;
    }

    if (current === closeToken) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
};

const extractAssignedObject = (source: string, assignmentPattern: RegExp): string | null => {
  const match = assignmentPattern.exec(source);
  const assignmentIndex = match?.index;

  if (assignmentIndex === undefined) {
    return null;
  }

  const objectStart = source.indexOf('{', assignmentIndex);

  if (objectStart < 0) {
    return null;
  }

  const objectEnd = findMatchingToken(source, objectStart, '{', '}');

  return objectEnd >= 0 ? source.slice(objectStart, objectEnd + 1) : null;
};

const extractSourceCodeObject = (storySource: string, exportName: string): string | null => {
  const exportObject = extractAssignedObject(
    storySource,
    new RegExp(`export\\s+const\\s+${exportName}\\b[\\s\\S]*?=`),
  );

  if (!exportObject) {
    return null;
  }

  return extractAssignedObject(exportObject, /\bsourceCode\s*:/);
};

const readImportedIdentifierSource = async (
  importMap: Map<string, string>,
  storyFilePath: string,
  identifier: string | undefined,
): Promise<{ fileName: string; source: string } | null> => {
  if (!identifier) {
    return null;
  }

  const importSpecifier = importMap.get(identifier.trim());

  if (!importSpecifier) {
    return null;
  }

  const importedFile = await readImportedFile(storyFilePath, importSpecifier);

  return {
    fileName: path.basename(importedFile.path),
    source: importedFile.source,
  };
};

const extractSimplePropertyValue = (
  sourceCodeObject: string,
  propertyName: string,
): string | undefined =>
  sourceCodeObject.match(new RegExp(`\\b${propertyName}\\s*:\\s*([A-Za-z_$][\\w$]*)`))?.[1];

const extractAdditionalSourceFiles = async (
  sourceCodeObject: string,
  importMap: Map<string, string>,
  storyFilePath: string,
): Promise<string[]> => {
  const arrayMatch = sourceCodeObject.match(/\badditionalSourceFiles\s*:\s*\[/);

  if (!arrayMatch || arrayMatch.index === undefined) {
    return [];
  }

  const arrayStart = sourceCodeObject.indexOf('[', arrayMatch.index);
  const arrayEnd = findMatchingToken(sourceCodeObject, arrayStart, '[', ']');

  if (arrayEnd < 0) {
    return [];
  }

  const arraySource = sourceCodeObject.slice(arrayStart + 1, arrayEnd);
  const blocks: string[] = [];

  for (let index = 0; index < arraySource.length; index += 1) {
    if (arraySource[index] !== '{') {
      continue;
    }

    const objectEnd = findMatchingToken(arraySource, index, '{', '}');

    if (objectEnd < 0) {
      break;
    }

    const objectSource = arraySource.slice(index, objectEnd + 1);
    const displayedFileName =
      objectSource.match(/\bdisplayedFileName\s*:\s*['"]([^'"]+)['"]/)?.[1] ?? 'source';
    const sourceIdentifier =
      objectSource.match(/\bsource\s*:\s*([A-Za-z_$][\w$]*)/)?.[1];
    const language = objectSource.match(/\blang\s*:\s*['"]([^'"]+)['"]/)?.[1] ?? 'text';
    const importedSource = await readImportedIdentifierSource(
      importMap,
      storyFilePath,
      sourceIdentifier,
    );

    if (importedSource) {
      blocks.push(createCodeFence(displayedFileName, language, importedSource.source));
    }

    index = objectEnd;
  }

  return blocks;
};

const getSourceBlocksForStoryExport = async (
  storyImportPath: string,
  exportName: string,
): Promise<string> => {
  const storyFilePath = await resolveImportPath(storyImportPath);
  const storySource = await readFile(storyFilePath, 'utf8');
  const importMap = buildImportMap(storySource);
  const sourceCodeObject = extractSourceCodeObject(storySource, exportName);

  if (!sourceCodeObject) {
    return '';
  }

  const htmlIdentifier = extractSimplePropertyValue(sourceCodeObject, 'htmlComponentSource');
  const tsIdentifier = extractSimplePropertyValue(sourceCodeObject, 'tsComponentSource');
  const htmlSource = await readImportedIdentifierSource(importMap, storyFilePath, htmlIdentifier);
  const tsSource = await readImportedIdentifierSource(importMap, storyFilePath, tsIdentifier);
  const additionalSourceBlocks = await extractAdditionalSourceFiles(
    sourceCodeObject,
    importMap,
    storyFilePath,
  );
  const blocks = [
    htmlSource ? createCodeFence(htmlSource.fileName, 'html', htmlSource.source) : '',
    tsSource ? createCodeFence(tsSource.fileName, 'typescript', tsSource.source) : '',
    ...additionalSourceBlocks,
  ].filter(Boolean);

  return blocks.join('\n\n');
};

const extractCanvasExportNames = (storySource: string): string[] => {
  const exportNames = new Set<string>();
  const canvasPattern = /<MyCanvas\b([^>]*)\/?>/g;

  for (const match of storySource.matchAll(canvasPattern)) {
    const storyReference = match[1].match(/\bof=\{([^}]+)\}/)?.[1];
    const exportName = storyReference ? extractCanvasExportName(storyReference) : null;

    if (exportName) {
      exportNames.add(exportName);
    }
  }

  return [...exportNames];
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

  const content = await readStorySource(docsEntry.importPath);
  const storyEntriesByExportName = buildStoryEntriesByExportName(docsEntry, getStoryEntries(index));
  const sourceBlocksByExportName = Object.fromEntries(
    await Promise.all(
      extractCanvasExportNames(content).map(async (exportName) => {
        const storyEntry = storyEntriesByExportName.get(exportName);

        if (!storyEntry?.importPath) {
          return [exportName, ''] as const;
        }

        return [exportName, await getSourceBlocksForStoryExport(storyEntry.importPath, exportName)] as const;
      }),
    ),
  );

  return {
    id: docsEntry.id!,
    name: docsEntry.title!,
    content,
    sourceBlocksByExportName,
  };
};
