import { base64Decode, base64Encode } from "../../helpers/base64";
import { decrypt, encrypt } from "../../helpers/encryption";
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";

const authenticationPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook<{ Querystring: { index?: string; token?: string } }>(
    "onRequest",
    async (req) => {
      const iv = req.query.index;
      const data = req.query.token;
      if (!data) {
        throw new Error("No data given.");
      }
      if (!iv) {
        throw new Error("No initialization vector given.");
      }
      const decrypted = decrypt({ iv, encryptedData: data });
      if (!decrypted) {
        throw new Error("Could not decrypt.");
      }
      const base64Decoded = base64Decode(decrypted);
      if (!base64Decoded) {
        throw new Error("Unable to decode string.");
      }
      const matches = base64Decoded.match(/^(.*?):(.*)$/);
      if (!matches || !matches[1] || !matches[2]) {
        throw new Error("Could not parse data.");
      }
      req.principal = {
        username: matches[1],
        password: matches[2],
      };
    }
  );
};

export const authentication = fp(authenticationPlugin);

declare module "fastify" {
  interface FastifyRequest {
    // you must reference the interface and not the type
    principal: { username: string; password: string } | undefined;
  }
}
