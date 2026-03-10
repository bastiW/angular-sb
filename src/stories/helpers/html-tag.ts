/**
 * HTML Tag to tell prettier that we format inline HTML as HTML.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw?retiredLocale=de#building_an_identity_tag
 */
export const html = (strings: TemplateStringsArray, ...values: any) =>
  String.raw({ raw: strings }, ...values);
