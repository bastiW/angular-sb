import type { StorybookIndex, StorybookStory } from '../../middleware/types.ts';

const sortByTitleThenName = (a: StorybookStory, b: StorybookStory): number =>
  a.title.localeCompare(b.title) || a.name.localeCompare(b.name);

const toStory = (
  fallbackId: string,
  id: string | undefined,
  title: string | undefined,
  name: string | undefined,
): StorybookStory => ({
  id: id ?? fallbackId,
  title: title ?? '',
  name: name ?? '',
});

const mapEntriesStories = (index: StorybookIndex): StorybookStory[] =>
  Object.entries(index.entries ?? {})
    .filter(([, entry]) => entry?.type === 'story')
    .map(([entryId, entry]) => toStory(entryId, entry.id, entry.title, entry.name));

const mapLegacyStories = (index: StorybookIndex): StorybookStory[] =>
  Object.entries(index.stories ?? {}).map(([entryId, story]) =>
    toStory(entryId, story.id, story.title ?? story.kind, story.name ?? story.story),
  );

export const extractStories = (index: StorybookIndex): StorybookStory[] => {
  const fromEntries = mapEntriesStories(index);
  const source = fromEntries.length > 0 ? fromEntries : mapLegacyStories(index);

  return source.sort(sortByTitleThenName);
};
