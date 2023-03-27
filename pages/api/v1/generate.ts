import * as t from "io-ts";
import { NextApiHandler } from "next";
import { base64Encode } from "../../../utils/base64";
import { encrypt } from "../../../utils/encryption";

const bodyType = t.type({
  username: t.string,
  password: t.string,
  addTravel: t.boolean,
  timeAfter: t.number,
  timeBefore: t.number,
});

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
  const href = `/api/v1/calendar?token=${encryptedData}&index=${iv}&addTravel=${
    req.body.addTravel ? "true" : "false"
  }&timeAfter=${req.body.timeAfter}&timeBefore=${req.body.timeBefore}`;
  res.status(200).json({ href });
};

export default hello;
