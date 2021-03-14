import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AppProps } from "next/app";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = useMemo(() => new QueryClient({}), []);

  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

const theme = extendTheme({
  colors: {},
});
