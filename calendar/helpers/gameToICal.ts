import { parse, addHours, subMinutes, addMinutes } from "date-fns";
import { Event } from "../icalendar";
import { parseGamesFromTableRows } from "../parseGamesFromTableRows";

export function gameToICal(
  game: ReturnType<typeof parseGamesFromTableRows>[number]
): Event[] {
  return [
    {
      url: `https://fogis.svenskfotboll.se/Fogisdomarklient/Match/MatchUppgifter.aspx?matchId=${game.id}`,
      uid: game.id + "_time_before",
      dataTimestamp: new Date(),
      startTime: subMinutes(game.time, 90),
      endTime: game.time,
      summary: `Förberedelser ${game.homeTeam?.name}-${game.awayTeam?.name}`,
      location: `${game.location?.name}`,
      description: [
        "Domare:",
        `HD: ${formatReferee(game.referees.referee)}`,
        game.referees.assistantReferee1?.name &&
          `AD1: ${formatReferee(game.referees.assistantReferee1)}`,
        game.referees.assistantReferee2?.name &&
          `AD2: ${formatReferee(game.referees.assistantReferee2)}`,
        game.referees.fourthOfficial?.name
          ? `4:e dom: ${formatReferee(game.referees.fourthOfficial)}`
          : null,
      ]
        .filter((x) => x)
        .join("\\n"),
    },
    {
      url: `https://fogis.svenskfotboll.se/Fogisdomarklient/Match/MatchUppgifter.aspx?matchId=${game.id}`,
      uid: game.id,
      dataTimestamp: new Date(),
      startTime: game.time,
      endTime: addHours(game.time, 2),
      summary: `${game.homeTeam?.name}-${game.awayTeam?.name}`,
      location: `${game.location?.name}`,
      description: [
        "Domare:",
        `HD: ${formatReferee(game.referees.referee)}`,
        game.referees.assistantReferee1?.name &&
          `AD1: ${formatReferee(game.referees.assistantReferee1)}`,
        game.referees.assistantReferee2?.name &&
          `AD2: ${formatReferee(game.referees.assistantReferee2)}`,
        game.referees.fourthOfficial?.name
          ? `4:e dom: ${formatReferee(game.referees.fourthOfficial)}`
          : null,
      ]
        .filter((x) => x)
        .join("\\n"),
    },
    {
      url: `https://fogis.svenskfotboll.se/Fogisdomarklient/Match/MatchUppgifter.aspx?matchId=${game.id}`,
      uid: game.id + "_time_after",
      dataTimestamp: new Date(),
      startTime: addHours(game.time, 2),
      endTime: addMinutes(addHours(game.time, 2), 30),
      summary: `Tid efter ${game.homeTeam?.name}-${game.awayTeam?.name}`,
      location: `${game.location?.name}`,
      description: [
        "Domare:",
        `HD: ${formatReferee(game.referees.referee)}`,
        game.referees.assistantReferee1?.name &&
          `AD1: ${formatReferee(game.referees.assistantReferee1)}`,
        game.referees.assistantReferee2?.name &&
          `AD2: ${formatReferee(game.referees.assistantReferee2)}`,
        game.referees.fourthOfficial?.name
          ? `4:e dom: ${formatReferee(game.referees.fourthOfficial)}`
          : null,
      ]
        .filter((x) => x)
        .join("\\n"),
    },
  ];
}

function formatReferee(
  referee: null | undefined | { name?: null | string; phone: string[] }
) {
  if (!referee) {
    return "";
  }
  return `${referee.name ?? "Okänt namn"}${
    referee.phone.length > 0 ? ` (${referee.phone.join(", ")})` : ""
  }`;
}
