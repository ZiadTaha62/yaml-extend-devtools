import * as vscode from "vscode";
import {
  ArgsToken,
  ArgsTokenType,
  ExprToken,
  ExprTokenType,
  KeyValueToken,
  KeyValueTokenType,
  LinePos,
  ModuleCache,
  Scalar,
  TextToken,
  TextTokenType,
} from "yaml-extend";
import { SCALAR_ARRAY_MAP } from "./scalar.js";
import { DIRECTIVE_ARRAY_MAP } from "./directives.js";

const EXPR_COLORS = [
  "exprMark",
  "exprBase",
  "exprPath",
  "dot",
  "argsMark",
  "key",
  "equal",
  "comma",
  "type",
] as const;

type DecorationsArray = {
  linePos: [LinePos, LinePos] | undefined;
  color: (typeof EXPR_COLORS)[number];
}[];

const DECORATION_TYPES: Record<
  (typeof EXPR_COLORS)[number],
  vscode.TextEditorDecorationType
> = {
  exprMark: vscode.window.createTextEditorDecorationType({
    color: "#EDA800",
  }),
  exprBase: vscode.window.createTextEditorDecorationType({
    color: "#EDA800",
  }),
  dot: vscode.window.createTextEditorDecorationType({
    color: "#FF5733",
  }),
  exprPath: vscode.window.createTextEditorDecorationType({
    color: "#CF8BA9",
  }),
  argsMark: vscode.window.createTextEditorDecorationType({
    color: "#FF5733",
  }),
  key: vscode.window.createTextEditorDecorationType({
    color: "#E26D5A",
  }),
  equal: vscode.window.createTextEditorDecorationType({
    color: "#F2C57C",
  }),
  comma: vscode.window.createTextEditorDecorationType({
    color: "#FF5733",
  }),
  type: vscode.window.createTextEditorDecorationType({
    color: "#A53860",
  }),
};

export function handleHighlights(doc: vscode.TextDocument, path: string) {
  // get editors
  const editors = vscode.window.visibleTextEditors.filter(
    (e) => e.document === doc
  );

  // if no editors return
  if (editors.length === 0) return;

  // create a map for decorations
  const expr_decoreMap: Record<
    (typeof EXPR_COLORS)[number],
    { type: vscode.TextEditorDecorationType; ranges: vscode.Range[] }
  > = {
    exprMark: { type: DECORATION_TYPES.exprMark, ranges: [] },
    exprBase: { type: DECORATION_TYPES.exprBase, ranges: [] },
    dot: { type: DECORATION_TYPES.dot, ranges: [] },
    exprPath: { type: DECORATION_TYPES.exprPath, ranges: [] },
    argsMark: { type: DECORATION_TYPES.argsMark, ranges: [] },
    key: { type: DECORATION_TYPES.key, ranges: [] },
    equal: { type: DECORATION_TYPES.equal, ranges: [] },
    comma: { type: DECORATION_TYPES.comma, ranges: [] },
    type: { type: DECORATION_TYPES.type, ranges: [] },
  };

  // array to hold decorations
  const exprDecorations: DecorationsArray = [];

  // handle highlights for both expressions and directives
  const scalarArray = SCALAR_ARRAY_MAP.get(path);
  const directivesArray = DIRECTIVE_ARRAY_MAP.get(path);

  if (scalarArray) exprDecorations.push(...handleScalarTokens(scalarArray));

  // push ranges for each decoration according to type
  for (const d of exprDecorations) {
    if (!d.linePos) continue;
    const range = new vscode.Range(
      d.linePos[0].line,
      d.linePos[0].col,
      d.linePos[1].line,
      d.linePos[1].col
    );
    expr_decoreMap[d.color].ranges.push(range);
  }

  // add highlights
  for (const ed of editors)
    for (const { type, ranges } of Object.values(expr_decoreMap)) {
      ed.setDecorations(type, ranges);
    }
}

function handleScalarTokens(scalarArray: Scalar[]): DecorationsArray {
  const decorations: DecorationsArray = [];
  for (const scalar of scalarArray) {
    // if multi line and not a block literal ignore
    if (
      scalar.type !== "BLOCK_LITERAL" &&
      scalar.linePos![0].line !== scalar.linePos![1].line
    )
      continue;
    // handle decorations
    decorations.push(...handleScalarTextTokens(scalar.tokens));
  }
  return decorations;
}

function handleScalarTextTokens(tokens: TextToken[]): DecorationsArray {
  const decorations: DecorationsArray = [];
  for (const tok of tokens) {
    switch (tok.type) {
      case TextTokenType.TEXT:
        break;

      case TextTokenType.EXPR:
        const open = tok.exprMarkOpen;
        const close = tok.exprMarkClose;
        if (open)
          decorations.push({ linePos: open.linePos, color: "exprMark" });
        if (close)
          decorations.push({ linePos: close.linePos, color: "exprMark" });
        decorations.push(...handleScalarExprTokens(tok.exprTokens ?? []));
        break;
    }
  }
  return decorations;
}
function handleScalarExprTokens(tokens: ExprToken[]): DecorationsArray {
  const decorations: DecorationsArray = [];
  for (const tok of tokens) {
    switch (tok.type) {
      case ExprTokenType.BASE:
        decorations.push({ linePos: tok.linePos, color: "exprBase" });
        break;

      case ExprTokenType.PATH:
        decorations.push({ linePos: tok.linePos, color: "exprPath" });
        break;

      case ExprTokenType.DOT:
        decorations.push({ linePos: tok.linePos, color: "dot" });
        break;

      case ExprTokenType.ARGS:
        const open = tok.argsMarkOpen;
        const close = tok.argsMarkClose;
        if (open)
          decorations.push({ linePos: open.linePos, color: "argsMark" });
        if (close)
          decorations.push({ linePos: close.linePos, color: "argsMark" });
        decorations.push(...handleScalarArgsTokens(tok.argsTokens ?? []));
        break;

      case ExprTokenType.TYPE:
        decorations.push({ linePos: tok.linePos, color: "exprBase" });
        break;
    }
  }
  return decorations;
}
function handleScalarArgsTokens(tokens: ArgsToken[]): DecorationsArray {
  const decorations: DecorationsArray = [];
  for (const tok of tokens) {
    switch (tok.type) {
      case ArgsTokenType.COMMA:
        decorations.push({ linePos: tok.linePos, color: "comma" });
        break;

      case ArgsTokenType.KEY_VALUE:
        decorations.push(...handleScalarKeyValueTokens(tok.keyValueToks ?? []));
        break;
    }
  }
  return decorations;
}
function handleScalarKeyValueTokens(tokens: KeyValueToken[]): DecorationsArray {
  const decorations: DecorationsArray = [];
  for (const tok of tokens) {
    switch (tok.type) {
      case KeyValueTokenType.KEY:
        decorations.push({ linePos: tok.linePos, color: "key" });
        break;

      case KeyValueTokenType.EQUAL:
        decorations.push({ linePos: tok.linePos, color: "equal" });
        break;

      case KeyValueTokenType.VALUE:
        decorations.push(...handleScalarTextTokens(tok.valueToks ?? []));
        break;
    }
  }
  return decorations;
}

function handleDirectiveTokens(
  tokens: ModuleCache["directives"]
): DecorationsArray {
  return [];
}
