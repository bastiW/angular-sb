import type { Meta } from '@storybook/angular';
import type { DocumentedStory } from '../../../documented-story';
import MyAwesomeButtonWithIconHtml from '!!raw-loader!./my-awesome-button-with-icon.html';
import MyAwesomeButtonWithIconTs from '!!raw-loader!./my-awesome-button-with-icon.ts';
import { MyAwesomeButtonWithIconStoryComponent } from './my-awesome-button-with-icon';
import { within } from 'storybook/test';


const meta: Meta<MyAwesomeButtonWithIconStoryComponent> = {
  title: 'Components/My Awesome Button',
  tags: [''],
  component: MyAwesomeButtonWithIconStoryComponent,
  args: {},
  argTypes: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // TODO CLI: Add tests here

    // You can make tests reusable by using the sharedTests function
    // await sharedTests<MyAwesomeButtonWithIconStoryComponent>(canvasElement, step)
  },
};
export default meta;

export const WithIcon: DocumentedStory<MyAwesomeButtonWithIconStoryComponent> = {
  name: 'With Icon',
  metaTitle: meta.title,
  sourceCode: {
    htmlComponentSource: MyAwesomeButtonWithIconHtml,
    tsComponentSource: MyAwesomeButtonWithIconTs,
  },
};
