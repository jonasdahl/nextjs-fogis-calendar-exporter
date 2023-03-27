import {
  Client,
  DirectionsRequest,
  LatLng,
} from "@googlemaps/google-maps-services-js";
import { QueryClient } from "react-query";

// This will be shared between multiple requests.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 60 * 24 * 7 } },
});

export async function addTransportMetadata<
  TGame extends {
    location: {
      name: string | null;
      position: null | { longitude: number; latitude: number };
    };
  }
>({
  games,
  userInfo,
  skipTravel,
}: {
  games: TGame[];
  userInfo: {
    street: string | null | undefined;
    zip: string | null | undefined;
    city: string | null | undefined;
  };
  skipTravel: boolean;
}) {
  const gamesWithTransport: {
    game: typeof games[number];
    transport: UnwrappedPromise<ReturnType<typeof getTransportMetadata>> | null;
  }[] = [];

  for (const game of games) {
    const destination: [number, number] | string | null = game.location.position
      ? [game.location.position.latitude, game.location.position.longitude]
      : game.location.name;
    if (!destination) {
      throw new Error("No destination (facility) was found for the game");
    }
    const transport = skipTravel
      ? null
      : await getTransportMetadata({
          destination,
          origin: `${userInfo.street}, ${userInfo.zip} ${userInfo.city}`,
        }).catch((e) => null);
    gamesWithTransport.push({ game, transport });
  }

  return gamesWithTransport;
}

type UnwrappedPromise<T> = T extends PromiseLike<infer U> ? U : T;

async function getTransportMetadata({
  destination,
  origin,
}: {
  destination: string | LatLng;
  origin: string | LatLng;
}) {
  if (!process.env.MAPS_API_KEY) {
    throw new Error("No maps API key in env MAPS_API_KEY");
  }
  const params: DirectionsRequest = {
    params: { destination, origin, key: process.env.MAPS_API_KEY },
  };

  await new Promise((resolve) => setTimeout(resolve, 500));
  const result = await queryClient.fetchQuery({
    queryKey: ["directions-api", params],
    queryFn: async () => {
      console.log("Querying Google maps directions API");
      const client = new Client();
      const response = await client.directions(params);
      return response;
    },
    retry: false,
  });

  const times = result.data.routes.map((route) =>
    route.legs.reduce((sum, leg) => sum + leg.duration.value * 1000, 0)
  );
  const min = Math.min(...times);
  const max = Math.max(...times);
  const sum = times.reduce((sum, agg) => sum + agg, 0);
  const avg = times.length === 0 ? null : sum / times.length;
  const mid = (min + max) / 2;
  const goodEnough = avg !== null ? (mid + avg) / 2 : mid;

  return { duration: { min, max, sum, avg, mid, goodEnough } };
}
