export const wait = (milliseconds: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
