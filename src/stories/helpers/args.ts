// All common used args are here

export type ThemePalette = 'primary' | 'accent' | 'warn' | 'error' | 'success' | undefined;

export const ariaLabelArg = {
  ariaLabel: 'your_custom_aria_label',
};

export const inputArgs = {
  ...ariaLabelArg,
  type: 'text',
  value: '',
  readOnly: true,
  required: false,
};

type ColorArgType = {
  color: {
    description: string;
    control: string;
    options: ThemePalette[];
  };
};

// All common used arg types are here
export const colorArgType: ColorArgType = {
  color: {
    description:
      "Color variant (In case you don't specify a color, the color definition from the wrapping element is used. This can be useful on buttons, tabs, input or any other element where mat-icon is included)",
    control: 'radio',
    options: [undefined, 'primary', 'error', 'success'] as ThemePalette[],
  },
};

export const backgroundColorArgType = {
  backgroundColor: {
    description: 'Background Color variant',
    control: colorArgType.color.control,
    options: [...colorArgType.color.options, undefined],
  },
};

export const ariaLabelArgType = {
  ariaLabel: {
    description:
      'The aria-label attribute defines a string value that labels an interactive element.',
  },
};
export const inputArgTypes = {
  type: {
    control: { type: 'select' },
    options: [
      'date',
      'datetime-local',
      'email',
      'month',
      'number',
      'password',
      'search',
      'tel',
      'text',
      'time',
      'url',
      'week',
    ],
    description: 'Type of form control',
  },
} as const;
