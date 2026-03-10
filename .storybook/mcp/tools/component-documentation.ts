import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';

import { getStoryDocumentation } from '../helpers/list-stories.ts';
import { getHeaderValue } from '../request-headers.ts';

type ContentTransformation = {
  input: string;
  output: string;
};

type DocumentationCleanupContext = {
  sourceBlocksByExportName: Record<string, string>;
};

type DocumentationCleanupRule = {
  matcher: (line: string, context: DocumentationCleanupContext) => boolean;
  matchEnd?: (line: string) => boolean;
  transformation: (
    line: string,
    context: DocumentationCleanupContext,
  ) => ContentTransformation;
};

const removeLine = (line: string): ContentTransformation => ({
  input: line,
  output: '',
});

const extractCanvasExportName = (line: string): string | null =>
  line.match(/\bof=\{([^}]+)\}/)?.[1]?.trim() ?? null;

const DOCUMENTATION_CLEANUP_RULES: DocumentationCleanupRule[] = [
  {
    matcher: (line) => line.trim().startsWith('import '),
    matchEnd: (line) => line.includes('<Meta'),
    transformation: removeLine,
  },
  {
    matcher: (line, context) => {
      const exportName = extractCanvasExportName(line);

      return (
        line.includes('<MyCanvas') &&
        Boolean(exportName && context.sourceBlocksByExportName[exportName])
      );
    },
    transformation: (line, context) => {
      const exportName = extractCanvasExportName(line);

      return {
        input: line,
        output: exportName ? context.sourceBlocksByExportName[exportName] ?? line : line,
      };
    },
  },
];

const applyCleanupRule = (
  content: string,
  rule: DocumentationCleanupRule,
  context: DocumentationCleanupContext,
): string => {
  const lines = content.split('\n');
  const output: string[] = [];
  let isMatching = false;

  for (const line of lines) {
    if (!isMatching && rule.matcher(line, context)) {
      isMatching = true;
    }

    if (isMatching && rule.matchEnd?.(line)) {
      isMatching = false;
      output.push(line);
      continue;
    }

    if (isMatching) {
      output.push(rule.transformation(line, context).output);
      if (!rule.matchEnd) {
        isMatching = false;
      }
      continue;
    }

    output.push(line);
  }

  return output.join('\n');
};

const cleanDocumentationContent = (
  content: string,
  context: DocumentationCleanupContext,
): string =>
  DOCUMENTATION_CLEANUP_RULES.reduce(
    (currentContent, rule) => applyCleanupRule(currentContent, rule, context),
    content,
  );

export const registerComponentDocumentationTool = (server: McpServer): void => {
  server.registerTool(
    'component_documentation',
    {
      title: 'Component Documentation',
      description: 'Get the MDX documentation page content for a component id.',
      inputSchema: {
        id: z.string(),
      },
      outputSchema: {
        id: z.string(),
        name: z.string(),
        content: z.string(),
      },
    },
    async ({ id }, extra) => {
      const documentation = await getStoryDocumentation(
        getHeaderValue(extra.requestInfo?.headers['host']),
        id,
      );
      const cleanedContent = cleanDocumentationContent(documentation.content, {
        sourceBlocksByExportName: documentation.sourceBlocksByExportName,
      });

      return {
        content: [
          {
            type: 'text',
            text: cleanedContent,
          },
        ],
        structuredContent: {
          ...documentation,
          content: cleanedContent,
        },
      };
    },
  );
};
