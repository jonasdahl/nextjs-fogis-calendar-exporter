export function base64Decode(token: string) {
  try {
    return Buffer.from(token, "base64").toString("ascii");
  } catch {
    return null;
  }
}

export function base64Encode(token: string) {
  try {
    return Buffer.from(token, "ascii").toString("base64");
  } catch {
    return null;
  }
}
