import { LiveParser } from "yaml-extend";

const Parser = new LiveParser({
  ignoreTags: true,
  unsafe: true,
  ignorePrivate: true,
  returnState: true,
});

export default Parser;
