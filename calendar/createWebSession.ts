import { CookieJar, JSDOM } from "jsdom";
import fetch, { RequestInit } from "node-fetch";
import { QueryClient } from "react-query";

const cacheClient = new QueryClient();

export function createWebSession() {
  const cookieJar = new CookieJar();

  const request = async (
    method: "GET" | "POST",
    url: string,
    options?: RequestInit
  ) => {
    console.log("Requesting", method.padEnd(4), url);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const cookieUrl = url;
    const res = await fetch(url, {
      method,
      ...(options ?? {}),
      headers: {
        ...(options ?? {}).headers,
        cookie: await cookieJar.getCookieString(cookieUrl),
      },
    });
    console.log("Response", res.status, "from", method.padEnd(4), url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch: ${res.status} ${
          res.statusText
        } Location: ${res.headers.get("Location")}`
      );
    }

    const newCookies = res.headers.get("set-cookie");
    if (newCookies) {
      cookieJar.setCookie(newCookies, cookieUrl);
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
    cookieJar,

    get: (url: string, options?: RequestInit) => {
      return request("GET", url, options);
    },

    getWithPublicCache: async (url: string, options?: RequestInit) => {
      const res = await cacheClient.fetchQuery({
        queryKey: url,
        queryFn: async () => {
          return await request("GET", url, options);
        },
        staleTime: 1000 * 60 * 60 * 24 * 7,
      });
      return res;
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
