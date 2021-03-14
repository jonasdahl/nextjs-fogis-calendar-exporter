import crypto from "crypto";

// Need this ugly thing to generate random strings for development
let key: Buffer | null = null;
function getKey() {
  if (key) {
    return key;
  }
  const appKey =
    !process.env.APP_KEY && process.env.NODE_ENV !== "development"
      ? crypto.randomBytes(32).toString("ascii")
      : process.env.APP_KEY;

  if (!appKey || appKey.length !== 32) {
    throw new Error("Environment APP_KEY should be a string of length 32.");
  }

  key = Buffer.from(appKey);

  return key;
}

const algorithm = "aes-256-cbc" as const;
const defaultIv = crypto.randomBytes(16);

export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(getKey()),
    defaultIv
  );
  const encrypted = cipher.update(text);
  const encryptedData = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: defaultIv.toString("hex"),
    encryptedData: encryptedData.toString("hex"),
  };
}

export function decrypt(text: { iv: string; encryptedData: string }) {
  const iv = Buffer.from(text.iv, "hex");
  const encryptedText = Buffer.from(text.encryptedData, "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(getKey()),
    iv
  );
  const decrypted = decipher.update(encryptedText);
  const decryptedData = Buffer.concat([decrypted, decipher.final()]);
  return decryptedData.toString();
}
