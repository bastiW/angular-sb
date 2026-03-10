import type { StorybookIndex } from './types.ts';

export const STORYBOOK_INDEX_PATH = '/index.json';

type FetchIndexSuccess = {
  ok: true;
  index: StorybookIndex;
};

type FetchIndexFailure = {
  ok: false;
  status: number;
};

export type FetchIndexResult = FetchIndexSuccess | FetchIndexFailure;

const buildIndexUrl = (host: string): string => `http://${host}${STORYBOOK_INDEX_PATH}`;

export const fetchIndex = async (host: string): Promise<FetchIndexResult> => {
  const indexResponse = await fetch(buildIndexUrl(host));

  if (!indexResponse.ok) {
    return {
      ok: false,
      status: indexResponse.status,
    };
  }

  return {
    ok: true,
    index: (await indexResponse.json()) as StorybookIndex,
  };
};
