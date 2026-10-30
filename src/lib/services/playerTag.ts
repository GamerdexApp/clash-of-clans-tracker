/** Trims, uppercases, swaps the letter O for 0 and adds the leading #, as the game shows a tag. */
export const normalizePlayerTag = (input: string): string => {
  const body = input.trim().replace(/^#+/, "").toUpperCase().replace(/O/g, "0");
  return body === "" ? "" : `#${body}`;
};
