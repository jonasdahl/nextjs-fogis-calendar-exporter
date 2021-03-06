import { parse, addHours, subMinutes, addMinutes } from "date-fns";
import { Event } from "../icalendar";
import { parseGamesFromTableRows } from "../parseGamesFromTableRows";

export function gameToICal({
  game,
  transport,
}: {
  game: ReturnType<typeof parseGamesFromTableRows>[number];
  transport: { duration: { goodEnough: number | null | undefined } };
}): Event[] {
  const travelExtraMinutes = 10;
  const travelLengthMs =
    transport.duration.goodEnough ?? (60 - travelExtraMinutes) * 60 * 1000;
  const travelLengthMinutes = Math.round(
    travelLengthMs / 1000 / 60 + travelExtraMinutes
  );

  const gameStart = game.time;
  const gameEnd = addMinutes(game.time, 45 + 45 + 15);

  const pregameEnd = gameStart;
  const pregameStart = subMinutes(pregameEnd, 90);

  const travelThereEnd = pregameStart;
  const travelThereStart = subMinutes(travelThereEnd, travelLengthMinutes);

  const postgameStart = gameEnd;
  const postgameEnd = addMinutes(postgameStart, 45);

  const travelBackStart = postgameEnd;
  const travelBackEnd = addMinutes(travelBackStart, travelLengthMinutes);

  const dataTimestamp = new Date();

  const description = [
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
    .join("\\n");
  const url = `https://fogis.svenskfotboll.se/Fogisdomarklient/Match/MatchUppgifter.aspx?matchId=${game.id}`;

  return [
    {
      url,
      uid: game.id + "_travel_to",
      dataTimestamp,
      startTime: travelThereStart,
      endTime: travelThereEnd,
      summary: `Resa till ${game.location?.name}`,
      location: `Bilen`,
      description,
    },
    {
      url,
      uid: game.id + "_pregame",
      dataTimestamp,
      startTime: pregameStart,
      endTime: pregameEnd,
      summary: `F??rberedelser ${game.homeTeam?.name}-${game.awayTeam?.name}`,
      location: `${game.location?.name}`,
      description,
    },
    {
      url,
      uid: game.id,
      dataTimestamp,
      startTime: gameStart,
      endTime: gameEnd,
      summary: `${game.homeTeam?.name}-${game.awayTeam?.name}`,
      location: `${game.location?.name}`,
      description,
    },
    {
      url,
      uid: game.id + "_postgame",
      dataTimestamp,
      startTime: postgameStart,
      endTime: postgameEnd,
      summary: `Tid efter ${game.homeTeam?.name}-${game.awayTeam?.name}`,
      location: `${game.location?.name}`,
      description,
    },
    {
      url,
      uid: game.id + "_travel_from",
      dataTimestamp,
      startTime: travelBackStart,
      endTime: travelBackEnd,
      summary: `Resa hem`,
      location: `Bilen`,
      description,
    },
  ];
}

function formatReferee(
  referee: null | undefined | { name?: null | string; phone: string[] }
) {
  if (!referee) {
    return "";
  }
  return `${referee.name ?? "Ok??nt namn"}${
    referee.phone.length > 0 ? ` (${referee.phone.join(", ")})` : ""
  }`;
}
