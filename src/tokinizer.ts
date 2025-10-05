/** Regex that holds escape characters. */
export const ESCAPE_CHAR_REGEX = /\"|\[|\'/;

/** Map that maps each escape character with it's closing character. */
export const ESCAPE_CLOSE_MAP: Record<string, string> = {
  '"': '"',
  "[": "]",
  "'": "'",
};

/** Delimiters used in the directives and expressions. */
export const DELIMITERS_REGEX = /\s|\.|\=/;

/** Regex to handle white spaces. */
export const WHITE_SPACE_REGEX = /\s/;

/**
 * Function to loop string and get indices of specific delimiter.
 * @param str - String that will be broken.
 * @param delimiter - Delimiter that will be used to divide string.
 * @param startIdx - Index to start looping at, default is zero.
 * @returns Array of breakpoints at which delimiter is detected.
 */
export function divideByDelimiter(
  str: string,
  delimiter: string,
  startIdx?: number
): number[] {
  /** Function to check for delimiter */
  const delimiterFunc = getDelimiterFunc(delimiter);

  /** Array to hold breakpoints */
  const breakpoints: number[] = [];

  /** Index to loop string */
  let i: number = startIdx ?? 0;

  // start looping
  while (i < str.length) {
    // get current char
    const cur = str[i];

    // if escape char skip until close
    if (
      ESCAPE_CHAR_REGEX.test(cur) &&
      (i === 0 || DELIMITERS_REGEX.test(str[i - 1]))
    ) {
      const closeChar = ESCAPE_CLOSE_MAP[cur];
      const endIdx = getNextChar(str, i, closeChar);
      i = endIdx === -1 ? str.length : endIdx + 1;
      continue;
    }

    // if delimiter add to parts
    if (delimiterFunc(cur)) breakpoints.push(i);

    i++;
  }

  // add last index as last breakpoint
  breakpoints.push(str.length);

  return breakpoints;
}

export function splitAtDelimiter(
  str: string,
  delimiter: string,
  startIdx?: number
): string[] {
  /** Var to hold parts. */
  let parts: string[] = [];
  /** Var to save last bp used. */
  let prev: number = 0;

  // get bps
  const bps = divideByDelimiter(str, delimiter, startIdx);

  // loop bps
  for (const bp of bps) {
    parts.push(str.slice(prev, bp));
    prev = Math.min(bp + 1, str.length);
  }

  // remove the wrap escape "", '' or []
  const handledParts = [];
  for (const p of parts) {
    // get first and last chars
    const firstChar = p.slice(0, 1);
    const lastChar = p.slice(p.length - 1, p.length);

    // if first char is escape char and last char is it's close then it's wrapped inside escape block
    const wrapped =
      ESCAPE_CHAR_REGEX.test(firstChar) &&
      ESCAPE_CLOSE_MAP[firstChar] === lastChar;

    // if wrapped remove first and last chars otherwise add it as it is
    if (wrapped) handledParts.push(p.slice(1, p.length - 1));
    else handledParts.push(p);
  }

  // return parts
  return handledParts;
}

/**
 * Function to loop string and get index of first specific delimiter.
 * @param str - String that will be broken.
 * @param delimiter - Delimiter that will be used to divide string.
 * @param startIdx - Index to start looping at, default is zero.
 * @returns Index of first delimiter, -1  if delimiter not present.
 */
export function getNextDelimiter(
  str: string,
  delimiter: string,
  startIdx?: number
): number {
  /** Function to check for delimiter */
  const delimiterFunc = getDelimiterFunc(delimiter);

  /** Var to hold next breakpoint for delimiter */
  let breakpoint: number = -1;

  /** Index to loop string */
  let i: number = startIdx ?? 0;

  // start looping
  while (i < str.length) {
    // get current char
    const cur = str[i];

    // if escape char skip until close
    if (
      ESCAPE_CHAR_REGEX.test(cur) &&
      (i === 0 || DELIMITERS_REGEX.test(str[i - 1]))
    ) {
      const closeChar = ESCAPE_CLOSE_MAP[cur];
      const endIdx = getNextChar(str, i, closeChar);
      i = endIdx === -1 ? str.length : endIdx + 1;
      continue;
    }

    // if delimiter add to parts
    if (delimiterFunc(cur)) {
      breakpoint = i;
      break;
    }

    i++;
  }

  return breakpoint;
}

/** Helper function to get function that will be used to check for delimiter occurance. */
function getDelimiterFunc(delimiter: string): (ch: string) => boolean {
  if (delimiter === " ") return (ch: string) => WHITE_SPACE_REGEX.test(ch);
  else return (ch: string) => ch === delimiter;
}

/**
 * Function to search for fisrt occurance of specific char.
 * @param str - String that will be checked.
 * @param startIndex - Index to start looping at, default is zero.
 * @param closeChar - Character saerched for.
 * @returns Index of the character. -1 if not present.
 */
export function getNextChar(
  str: string,
  startIndex: number,
  closeChar: string
) {
  let i = startIndex + 1;
  let charPresent: boolean = false;

  while (i < str.length) {
    const cur = str[i];
    if (cur === "\\") {
      // handle escaped char (e.g. \" or \\)
      if (i + 1 < str.length) {
        i += 2;
        continue;
      } else {
        // trailing backslash — include it
        i++;
        continue;
      }
    }
    if (cur === closeChar) {
      charPresent = true;
      break;
    }
    i++;
  }

  return charPresent ? i : -1;
}
