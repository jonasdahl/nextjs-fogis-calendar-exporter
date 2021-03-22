import { zonedTimeToUtc } from "date-fns-tz";
import { parse } from "date-fns";

export function parseGamesFromTableRows(rows: NodeListOf<Element>) {
  if (!rows) {
    throw new Error("No table rows found.");
  }
  const games = [];
  for (const row of rows) {
    if (row.className === "gomd") {
      continue;
    }
    if (row.tagName !== "TR") {
      throw new Error("Found unknown row " + row.tagName);
    }
    if (row.children.length !== 8) {
      throw new Error(
        "Game column length was not 8 but " + row.children.length
      );
    }
    const timeString = row.children.item(0)?.textContent;
    const time = parseTimeString(timeString);
    const facilityColumn = row.children.item(5);
    const facility = facilityColumn?.childNodes.item(0).textContent?.trim();
    const teams = row.children.item(4)?.innerHTML;
    const teamRegexResult = teams?.match(/^(.*)&nbsp;-&nbsp;(.*)$/);
    const homeTeamName = teamRegexResult?.[1];
    const awayTeamName = teamRegexResult?.[2];
    if (!homeTeamName || !awayTeamName) {
      throw new Error("Unable to parse teams.");
    }
    const competitionName = row.children.item(1)?.textContent;
    const round = Number(row.children.item(2)?.textContent);

    const refereeCol = row.children.item(6);
    const referees = [
      ...(refereeCol?.querySelectorAll(
        "span:not(.uppskjutenMatchDomaruppdrag)"
      ) ?? []),
    ].reduce((agg, element) => {
      const content = element.textContent?.trim();
      const parts = content?.match(/^\((.*?)\)\s+(.*)$/);
      const role = parts?.[1];
      const name = parts?.[2];
      if (!role || !name) {
        throw new Error("Unable to parse referee");
      }
      let phone: string[] = [];
      if (element.classList.contains("annanDomaresUppdrag")) {
        const metadataNode = element.nextSibling?.nextSibling?.nextSibling;
        const metadata = metadataNode?.textContent?.trim();
        if (!metadata) {
          throw new Error("Could not find phone numbers for referee");
        }
        phone = [...new Set(metadata.match(/\+?\d+/g))];
      }
      return {
        ...agg,
        [keyForRole(role)]: {
          name,
          phone,
        },
      };
    }, {} as Record<string, { name: string; phone: string[] }>);

    const id = row.children.item(3)?.textContent;

    if (
      !time ||
      !id ||
      !facility ||
      !homeTeamName ||
      !awayTeamName ||
      !competitionName
    ) {
      continue;
    }

    games.push({
      time,
      id,
      location: {
        name: facility,
      },
      homeTeam: {
        name: homeTeamName,
      },
      awayTeam: {
        name: awayTeamName,
      },
      context: {
        competition: {
          name: competitionName,
        },
        round,
      },
      referees,
    });
  }

  return games;
}

function parseTimeString(timeString: string | null | undefined) {
  if (!timeString) {
    return null;
  }
  try {
    return zonedTimeToUtc(
      parse(timeString, "yyyy-MM-dd HH:mm", Date.now()),
      "Europe/Stockholm"
    );
  } catch {
    try {
      const str = timeString.replace("(Tid ej fastställd)", "12:00").trim();
      return zonedTimeToUtc(
        parse(str, "yyyy-MM-dd HH:mm", Date.now()),
        "Europe/Stockholm"
      );
    } catch {
      return null;
    }
  }
}

function keyForRole(role: string): string {
  switch (role) {
    case "Dom":
      return "referee";
    case "AD1":
      return "assistantReferee1";
    case "AD2":
      return "assistantReferee2";
    case "4:e dom":
      return "fourthOfficial";
    default:
      throw new Error("Unknown referee role " + role);
  }
}
