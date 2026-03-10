export function parseTsModuleSource(source: string): string {
  const startMarker = '// PARSER_START';
  const endMarker = '// PARSER_END';

  const startIndex = source.indexOf(startMarker);
  const endIndex = source.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    return source.substring(startIndex + startMarker.length, endIndex);
  } else {
    return '';
  }
}
