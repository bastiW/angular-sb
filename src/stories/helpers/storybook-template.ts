import { Meta, StoryObj } from '@storybook/angular';

function splitFirstOccurrence(str: string, separator: string) {
  const [first, ...rest] = str.split(separator);

  const remainder = rest.join(separator);

  return [first, remainder];
}

/**
 * Get's the attributes from the args. If the args is ngContent or directive it get's skipped
 * @param args
 */
function getArgsString(
  args: any,
  relevantArgKeys: string[],
  directive?: string,
  htmlClass?: string,
): string {
  return Object.keys(args)
    .filter((arg) => {
      return relevantArgKeys?.includes(arg);
    })
    .map((key) => {
      const value = args[key];
      const valueType = typeof value;

      // filter out directive and class, because we don't want to show it & merges it with the relevant args from the function parameter
      // filter ngContent
      if (
        key === 'ngContent' ||
        (directive && value === directive) ||
        (htmlClass && value === htmlClass)
      ) {
        return '';
      }

      if (key === 'disabled' && (value === false || value === 'false')) {
        return '';
      }

      // Custom overwrites
      switch (key) {
        case 'ariaLabel':
          return `aria-label="${value}"`;
      }

      switch (key) {
        case 'ariaLabel':
          return `aria-label="${value}"`;
      }

      switch (valueType) {
        case 'boolean':
          return `[${key}]="${value}"`;
        case 'string':
          return `[${key}]="'${value}'"`;
        case 'number':
          return `[${key}]="${value}"`;
        case 'undefined':
          return `[${key}]="${undefined}"`;
        default:
          throw new Error(`Could not match key ${key} with value ${value}`);
      }
    })
    .join(' ');
}

/**
 * Gets the directives as string
 * @param directive
 */
function getDirectivesString(directive?: string): string {
  if (!directive) {
    return '';
  }
  return directive;
}

function getHtmlClassString(htmlClass?: string) {
  if (!htmlClass) {
    return '';
  }
  return `class="${htmlClass}"`;
}

// type ComponentArgs = { [key: string]: unknown };

/**
 * Inject args into the HTML. Use it inside the render function of storybook
 *
 * It returns the Angular HTML of the component
 *
 * @deprecated Use native storybook argsToTemplate function instead https://storybook.js.org/docs/writing-stories/args#args-can-modify-any-aspect-of-your-component
 *
 * @param html the html of the component
 * @param args All the current args of the component as an object, the args is a parameter or the render function. If the args is ngContent it get's skipped
 * @param relevantArgs provide an object with args which are relevant. This can be useful when you use function nested for the output an only want to display the relevant values
 * @param directive provide a angular directive
 */
export function injectArgsToHtml({
  html,
  args,
  relevantArgs,
  directive,
  htmlClass,
}: {
  html: string;
  args: any;
  relevantArgs?: { [key: string]: unknown };
  directive?: string;
  htmlClass?: string;
}): string {
  let splittedHtml: string[] = [];

  if (html.includes('/>')) {
    splittedHtml = splitFirstOccurrence(html, '/>');
  } else {
    splittedHtml = splitFirstOccurrence(html, '>');
  }

  const outputHtml = `${splittedHtml[0]} ${getHtmlClassString(
    htmlClass,
  )}${getDirectivesString(directive)} ${getArgsString(
    args,
    relevantArgs ? Object.keys(relevantArgs) : Object.keys(args),
    directive,
    htmlClass,
  )}>${splittedHtml[1]}`;

  return outputHtml;
}

export type WithNgContent<T> = T & { ngContent: string };
export type MetaWithNgContent<T> = Meta<WithNgContent<T>>;
export type StoryObjWithNgContent<T> = StoryObj<WithNgContent<T>>;
