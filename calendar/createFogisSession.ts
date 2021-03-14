import { createWebSession } from "./createWebSession";
import { JSDOM } from "jsdom";
import { parseGamesFromTableRows } from "./parseGamesFromTableRows";

export function createFogisSession() {
  const session = createWebSession();

  return {
    getGames: async () => {
      const listDom = await session
        .get(
          "https://fogis.svenskfotboll.se/Fogisdomarklient/Uppdrag/UppdragUppdragLista.aspx",
          { follow: 0 }
        )
        .then((res) => res.dom());
      const rows = listDom.window.document.querySelectorAll(
        "table.fogisInfoTable tbody tr"
      );
      if (!rows) {
        throw new Error("No table rows found.");
      }
      const games = parseGamesFromTableRows(rows);
      return games;
    },

    login: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      console.log("Loggin in user:", username);
      const loginDom = await session
        .get("https://fogis.svenskfotboll.se/Fogisdomarklient/Login/Login.aspx")
        .then((res) => res.dom());
      await session.post(
        "https://fogis.svenskfotboll.se/Fogisdomarklient/Login/Login.aspx",
        {
          formData: {
            __VIEWSTATE: getFieldValue(loginDom, "__VIEWSTATE"),
            __VIEWSTATEGENERATOR: getFieldValue(
              loginDom,
              "__VIEWSTATEGENERATOR"
            ),
            __EVENTVALIDATION: getFieldValue(loginDom, "__EVENTVALIDATION"),
            tbAnvandarnamn: username,
            tbLosenord: password,
            btnLoggaIn: "Logga in",
          },
        }
      );
      // TODO Verify login
    },
  };
}

function getFieldValue(dom: JSDOM, name: string) {
  const element = dom.window.document.querySelector(`[name="${name}"]`);
  if (!element) {
    throw new Error("Could not get field with name " + name);
  }
  const value = (element as HTMLInputElement).value;
  return value;
}
