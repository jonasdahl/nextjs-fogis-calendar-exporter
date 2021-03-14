import { CookieJar, JSDOM } from "jsdom";
import fetch, { RequestInit } from "node-fetch";

export function createWebSession() {
  const cookieJar = new CookieJar();

  const request = async (
    method: "GET" | "POST",
    url: string,
    options?: RequestInit
  ) => {
    console.log("Requesting", method.padEnd(4), url);

    const cookieUrl = url;
    const res = await fetch(url, {
      method,
      ...(options ?? {}),
      headers: {
        ...(options ?? {}).headers,
        cookie: cookieJar.getCookieStringSync(cookieUrl),
      },
    });
    console.log("Response", res.status, "from", method.padEnd(4), url);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    const rawHeaders = res.headers.raw();

    const newCookies = rawHeaders?.["set-cookie"];
    if (newCookies) {
      newCookies.forEach((cookie) =>
        cookieJar.setCookieSync(cookie, cookieUrl)
      );
    }

    return {
      text: () => res.text(),
      dom: async () => {
        const text = await res.text();
        const dom = new JSDOM(text);
        return dom;
      },
    };
  };

  return {
    get: (url: string, options?: RequestInit) => {
      return request("GET", url, options);
    },

    post: (
      url: string,
      options?: RequestInit & { formData?: Record<string, string> }
    ) => {
      const params = new URLSearchParams();
      const values = Object.entries(options?.formData ?? {});
      for (const [key, value] of values) {
        params.append(key, value);
      }
      const { formData: throwAway, ...opts } = options?.formData ?? {};
      return request("POST", url, { ...opts, body: params });
    },

    request,
  };
}
