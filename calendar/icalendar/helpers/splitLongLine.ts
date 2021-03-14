export function splitLongLine(line: string): string[] {
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

  if (line.length <= 75) {
    return [line];
  }
  const firstLine = line.slice(0, 75);
  const rest = "\t" + line.slice(75, line.length);

  return [firstLine, ...splitLongLine(rest)];
}
