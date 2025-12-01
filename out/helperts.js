// /** Helper function to convert yaml's range into vscode range. */
// export function convertRange(
//   text: string,
//   range: [number, number]
// ): { startLine: number; startChar: number; endLine: number; endChar: number } {
//   let [start, end] = range;
export {};
//   // clamp
//   const n = text.length;
//   if (start < 0) start = 0;
//   if (end < 0) end = 0;
//   if (start > n) start = n;
//   if (end > n) end = n;
//   // optional: normalize order (uncomment if you want)
//   // if (end < start) [start, end] = [end, start];
//   let startLine = 0;
//   let endLine = 0;
//   let startChar = 0;
//   let endChar = 0;
//   // current scanning state
//   let curLine = 0;
//   let lineStartIdx = 0; // index of first char of current line
//   // walk once from i = 0 up to str.length, and compute positions when we reach start/end
//   for (let i = 0; i <= n; i++) {
//     // if we've reached the offsets, capture them
//     if (i === start) {
//       startLine = curLine;
//       startChar = start - lineStartIdx;
//     }
//     if (i === end) {
//       endLine = curLine;
//       endChar = end - lineStartIdx;
//       // If both captured and start <= end, we can stop early
//       if (i >= start) break;
//     }
//     if (i === n) break; // reached end of string
//     const ch = text[i];
//     if (ch === "\n") {
//       curLine++;
//       lineStartIdx = i + 1;
//     }
//   }
//   return { startLine, startChar, endLine, endChar };
// }
// /** Function to perform binary search on ranges. */
// export function binarySearch(
//   ranges: { start: number; end: number }[],
//   pos: number
// ) {
//   let lo = 0;
//   let hi = ranges.length - 1;
//   while (lo <= hi) {
//     const mid = Math.floor((lo + hi) / 2);
//     const r = ranges[mid];
//     if (pos < r.start) hi = mid - 1;
//     else if (pos >= r.end) lo = mid + 1;
//     else return r;
//   }
//   return null;
// }
//# sourceMappingURL=helperts.js.map