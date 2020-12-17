export const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(() => resolve(true), milliseconds))
