import { splitLongLine } from "./splitLongLine";

export function splitLongLines(lines: string[]) {
  return lines
    .map((line) => {
      // Lines of text SHOULD NOT be longer than 75 octets, excluding the line
      // break.  Long content lines SHOULD be split into a multiple line
      // representations using a line "folding" technique.  That is, a long
      // line can be split between any two characters by inserting a CRLF
      // immediately followed by a single linear white-space character (i.e.,
      // SPACE or HTAB).  Any sequence of CRLF followed immediately by a
      // single linear white-space character is ignored (i.e., removed) when
      // processing the content type.
      //
      // source: https://tools.ietf.org/html/rfc5545#section-3

      return splitLongLine(line);
    })
    .reduce((agg, val) => {
      return [...agg, ...val];
    }, []);
}
