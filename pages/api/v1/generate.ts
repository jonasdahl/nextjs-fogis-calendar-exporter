import { NextApiHandler } from "next";
import { base64Encode } from "../../../utils/base64";
import { encrypt } from "../../../utils/encryption";
import * as t from "io-ts";

const bodyType = t.type({ username: t.string, password: t.string });

const hello: NextApiHandler = (req, res) => {
  if (req.method !== "POST") {
    throw new Error("Invalid method");
  }
  if (!bodyType.is(req.body)) {
    throw new Error("Invalid body");
  }
  const { encryptedData, iv } = encrypt(
    base64Encode(`${req.body.username}:${req.body.password}`)!
  );
  const href = `/api/v1/calendar?token=${encryptedData}&index=${iv}`;
  res.status(200).json({ href });
};

export default hello;
