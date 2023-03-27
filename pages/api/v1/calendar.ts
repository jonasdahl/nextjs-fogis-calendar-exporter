import * as t from "io-ts";
import { flatten } from "lodash";
import { NextApiHandler } from "next";
import { createFogisSession } from "../../../calendar/createFogisSession";
import { gameToICal } from "../../../calendar/helpers/gameToICal";
import { iCalendar } from "../../../calendar/icalendar";
import { addTransportMetadata } from "../../../transport/transportMetadata";
import { base64Decode } from "../../../utils/base64";
import { decrypt } from "../../../utils/encryption";

const queryType = t.type({
  index: t.string,
  token: t.string,
  addTravel: t.string,
  timeAfter: t.string,
  timeBefore: t.string,
});

const hello: NextApiHandler = async (req, res) => {
  if (!queryType.is(req.query)) {
    throw new Error("Invalid query types");
  }
  const decrypted = decrypt({
    iv: req.query.index,
    encryptedData: req.query.token,
  });
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

  const username = matches[1];
  const password = matches[2];

  const fogisSession = createFogisSession();
  await fogisSession.login({ username, password });
  const games = await fogisSession.getGames();
  const userInfo = await fogisSession.getUserInfo();

  const gamesWithTransport = await addTransportMetadata({
    games,
    userInfo,
    skipTravel: req.query.addTravel === "false",
  });

  const calendar = iCalendar({
    productId: "-//Matcher i Fogis//Domare//SV",
    name: "Matcher i Fogis",
  });

  console.log(req.query, gamesWithTransport);

  const events = flatten(
    gamesWithTransport.map(({ game, transport }) =>
      gameToICal({
        game,
        transport,
        timeAfter: Number(req.query.timeAfter) || 0,
        timeBefore: Number(req.query.timeBefore) || 0,
      })
    )
  );
  calendar.addEvents(events);

  res.setHeader("cache-control", `max-age=${60 * 30}`);
  res.setHeader("content-disposition", "attachment; filename=calendar.ics");
  res.send(calendar.toString());
};

export default hello;
