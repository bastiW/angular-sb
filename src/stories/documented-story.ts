import type { StoryObj } from '@storybook/angular';
import {SourceCode} from './storybook-blocks/MySourceCode';

export type DocumentedStory<ComponentType> = StoryObj<ComponentType> & {
  sourceCode?: SourceCode;
  /**
   * MetaTitle is required for the fullscreen mode button below the MyCanvas Component
   */
  metaTitle?: string;
};
