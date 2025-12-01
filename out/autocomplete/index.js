// import * as vscode from "vscode";
// import { splitAtDelimiter } from "../tokinizer.js";
// import {
//   handleImportParamsExpr,
//   handleImportPath,
//   handleLocal,
//   handleParam,
//   handleThisLocals,
//   handleThisPath,
// } from "./expressions.js";
// import { handleImportParamsDir, handlePrivate } from "./directives.js";
export {};
// const EXPR_BASES = ["this", "import", "local", "param"];
// const DIR_BASES = ["IMPORT", "FILENAME", "LOCAL", "PARAM", "PRIVATE"];
// const DOLLAR_REGEX = /\$(?:\{\s*)?(.*)$/;
// const DOT_DOLLAR_REGEX = /\$(?:\{\s*)?([A-aZ-z]+)((?:\.[^\.]+)*\.?)$/;
// const SPACE_DOLLAR_REGEX = /\$(?:\{\s*)?([A-aZ-z]+)((?:\.[^\.]+)*\.?)$/;
// const PERCENT_REGEX = /^\%[^\s]*$/;
// const SPACE_PERCENT_REGEX = /^\%[^\s]*\s(.*)$/;
// export const onDollarAutoComplete =
//   vscode.languages.registerCompletionItemProvider(
//     { scheme: "file", language: "yaml" },
//     {
//       provideCompletionItems(document, position, token, context) {
//         if (document.languageId !== "yaml") return null;
//         const line = document.lineAt(position.line).text;
//         const prefix = line.slice(0, position.character);
//         // 1) If cursor is after a $ or partial $<chars>, suggest EXPR_BASES filtered by partial.
//         const dollarMatch = prefix.match(DOLLAR_REGEX);
//         if (dollarMatch) {
//           const partial = dollarMatch[1] ?? "";
//           const startChar = position.character - partial.length;
//           const replaceRange = new vscode.Range(
//             position.line,
//             startChar,
//             position.line,
//             position.character
//           );
//           const items = EXPR_BASES.filter((b) => b.startsWith(partial)).map(
//             (b) => {
//               const item = new vscode.CompletionItem(
//                 b,
//                 vscode.CompletionItemKind.Variable
//               );
//               // replace only the characters after the $ (so $ stays)
//               item.range = replaceRange;
//               // allow committing with '.' so user can type "$import." and keep going
//               item.commitCharacters = ["."];
//               item.insertText = b;
//               return item;
//             }
//           );
//           return new vscode.CompletionList(items, true);
//         }
//         return null;
//       },
//     },
//     "$"
//   );
// export const onDotAutoComplete =
//   vscode.languages.registerCompletionItemProvider(
//     { scheme: "file", language: "yaml" },
//     {
//       provideCompletionItems(document, position, token, context) {
//         if (document.languageId !== "yaml") return null;
//         const filename = document.fileName;
//         const line = document.lineAt(position.line).text;
//         const prefix = line.slice(0, position.character);
//         // 2) If cursor is right after a dot following a $base. (e.g. "$import."), suggest props from cache
//         const dotDollarMatch = prefix.match(DOT_DOLLAR_REGEX);
//         if (dotDollarMatch) {
//           const base = dotDollarMatch[1];
//           let pathStr = dotDollarMatch[2] || "";
//           if (pathStr.startsWith(".")) pathStr = pathStr.slice(1); // remove starting "."
//           // handle according to base
//           if (base === "import") {
//             const segments = splitAtDelimiter(pathStr, ".");
//             return handleImportPath(filename, segments, position);
//           }
//           if (base === "this") {
//             const segments = splitAtDelimiter(pathStr, ".");
//             return handleThisPath(filename, segments, position);
//           }
//           if (base === "local") return handleLocal(filename, pathStr, position);
//           if (base === "param") return handleParam(filename, pathStr, position);
//           // no suggestions if traversal failed or landed on primitive
//           return null;
//         }
//         return null;
//       },
//     },
//     "."
//   );
// export const onSpaceAutoComplete =
//   vscode.languages.registerCompletionItemProvider(
//     { scheme: "file", language: "yaml" },
//     {
//       provideCompletionItems(document, position, token, context) {
//         if (document.languageId !== "yaml") return null;
//         const filename = document.fileName;
//         const line = document.lineAt(position.line).text;
//         const prefix = line.slice(0, position.character);
//         // 2) If cursor is right after a dot following a $base. (e.g. "$import."), suggest props from cache
//         const spaceDollarMatch = prefix.match(SPACE_DOLLAR_REGEX);
//         if (spaceDollarMatch) {
//           const segments = splitAtDelimiter(spaceDollarMatch[0], " ");
//           if (segments.length < 2) return null; // at least starting $this... or $import... then a space (2 segments)
//           // get expr base
//           const exprBase = segments.shift() as string;
//           // map remaining segments so you get only alias (key) from key=value pairs
//           const keys = segments.map((s) => splitAtDelimiter(s, "=")[0]);
//           // if last segment (currently updated by user) assigns value return
//           if (splitAtDelimiter(segments[segments.length - 1], "=").length > 1)
//             return null;
//           // handle according to base
//           if (exprBase.startsWith("$this"))
//             return handleThisLocals(filename, keys, position);
//           if (exprBase.startsWith("$import"))
//             return handleImportParamsExpr(filename, keys, position, exprBase);
//           // no suggestions if traversal failed or landed on primitive
//           return null;
//         }
//         const spacePercentMatch = prefix.match(SPACE_PERCENT_REGEX);
//         if (spacePercentMatch) {
//           const segments = splitAtDelimiter(spacePercentMatch[0], " ");
//           if (segments.length < 2) return null; // at least starting $this... or $import... then a space (2 segments)
//           // get expr base
//           const dirBase = segments.shift() as string;
//           // if last segment (currently updated by user) assigns value return
//           if (splitAtDelimiter(segments[segments.length - 1], "=").length > 1)
//             return null;
//           // handle according to base
//           if (dirBase === "%PRIVATE")
//             return handlePrivate(filename, segments, position);
//           if (dirBase === "%IMPORT")
//             return handleImportParamsDir(filename, segments, position);
//           // no suggestions if traversal failed or landed on primitive
//           return null;
//         }
//         return null;
//       },
//     },
//     " "
//   );
// export const onPercentAutoComplete =
//   vscode.languages.registerCompletionItemProvider(
//     { scheme: "file", language: "yaml" },
//     {
//       provideCompletionItems(document, position, token, context) {
//         if (document.languageId !== "yaml") return null;
//         const line = document.lineAt(position.line).text;
//         const prefix = line.slice(0, position.character);
//         const percentMatch = prefix.match(PERCENT_REGEX);
//         if (percentMatch) {
//           const partial = percentMatch[1] ?? "";
//           const startChar = position.character - partial.length;
//           const replaceRange = new vscode.Range(
//             position.line,
//             startChar,
//             position.line,
//             position.character
//           );
//           const items = DIR_BASES.filter((b) => b.startsWith(partial)).map(
//             (b) => {
//               const item = new vscode.CompletionItem(
//                 b,
//                 vscode.CompletionItemKind.Variable
//               );
//               item.range = replaceRange;
//               item.insertText = b + " ";
//               return item;
//             }
//           );
//           return new vscode.CompletionList(items, true);
//         }
//         return null;
//       },
//     },
//     "%"
//   );
//# sourceMappingURL=index.js.map