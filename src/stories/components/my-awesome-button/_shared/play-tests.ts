import type { AngularRenderer } from '@storybook/angular';
import { within } from 'storybook/test';
import type { StepFunction } from 'storybook/internal/types';

export async function sharedTests<T>(
  canvasElement: HTMLElement,
  step: StepFunction<AngularRenderer, T>,
) {
  const canvas = within(canvasElement);
}
