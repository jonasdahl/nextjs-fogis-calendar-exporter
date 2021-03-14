import { FastifyLoggerInstance, FastifyPluginAsync } from "fastify";
import { JSDOM } from "jsdom";
import { authentication } from "./authentication";
import { createFogisSession } from "./createFogisSession";
import { gameToICal } from "./helpers/gameToICal";
import { iCalendar } from "./icalendar";

export const calendar: FastifyPluginAsync = async (fastify) => {
  fastify.register(authentication);

  fastify.get("/", async (req, res) => {
    const fogisSession = createFogisSession({ logger: fastify.log });
    if (!req.principal) {
      throw new Error("No user in context");
    }
    await fogisSession.login({
      username: req.principal?.username,
      password: req.principal?.password,
    });
    const games = await fogisSession.getGames();

    res.header("cache-control", `max-age=${60 * 30}`);

    const events = games.map((game) => gameToICal(game));

    const calendar = iCalendar({
      productId: "-//Matcher i Fogis//Jonas Dahl//SV",
      name: "Matcher i Fogis",
    });

    calendar.addEvents(events);

    res.type("text/html");
    res.header("content-disposition", "attachment; filename=calendar.ics");

    return calendar.toString();
  });
};
