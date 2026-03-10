/**
 * We are using the new ?raw loader syntax when we want to receive a file which is compiled
 */
declare module '*?raw' {
  const content: any;
  export default content;
}
/**
 * We are using the deprecated !!raw-loader!* when we want the real raw without compilation. Like for documentation.
 */
declare module '!!raw-loader!*' {
  const contents: string;
  export = contents;
}
