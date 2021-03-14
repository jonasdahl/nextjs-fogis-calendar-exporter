import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";
import Head from "next/head";
import { FormEvent, useState } from "react";
import { useMutation } from "react-query";
import * as t from "io-ts";

export default function Home() {
  const { isLoading, mutate, error, data: link, reset } = useMutation(
    async ({ username, password }: { username: string; password: string }) => {
      const res = await fetch("/api/v1/generate", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "content-type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Failed to generate link.");
      }
      const json = await res.json();
      const resultType = t.type({ href: t.string });
      if (!resultType.is(json)) {
        throw new Error("JSON was malformed");
      }
      return json.href;
    }
  );

  const handleSubmit = (args: { username: string; password: string }) => {
    mutate(args);
  };

  return (
    <>
      <Head>
        <title>Fogis Ical Export</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Center flexGrow={1}>
        <Box
          width="400px"
          maxW="100%"
          shadow="lg"
          p={6}
          borderRadius="md"
          backgroundColor="white"
        >
          {!link ? (
            error ? (
              <ErrorModal onReset={reset} />
            ) : (
              <Form onSubmit={handleSubmit} isLoading={isLoading} />
            )
          ) : (
            <ShowLink link={link ?? ""} onReset={reset} />
          )}
        </Box>
      </Center>
    </>
  );
}

function ErrorModal({ onReset }: { onReset: () => void }) {
  return (
    <VStack spacing={4}>
      <Box>An error occurred</Box>
      <Button type="button" onClick={onReset}>
        Back
      </Button>
    </VStack>
  );
}

function ShowLink({ link, onReset }: { link: string; onReset: () => void }) {
  return (
    <VStack spacing={4}>
      <Input
        autoFocus
        onFocus={(e) => e.target.select()}
        value={`${window.location.origin}${link}`}
      />
      <Button type="button" onClick={onReset}>
        Back
      </Button>
    </VStack>
  );
}

function Form({
  onSubmit,
  isLoading,
}: {
  isLoading: boolean;
  onSubmit: (args: { username: string; password: string }) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ password, username });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel htmlFor="tbAnvandarnamn">Användarnamn</FormLabel>
          <Input
            name="tbAnvandarnamn"
            id="tbAnvandarnamn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="tbLosenord">Lösenord</FormLabel>
          <Input
            name="tbLosenord"
            id="tbLosenord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <Button type="submit" isLoading={isLoading}>
          Generera ICal-länk
        </Button>
      </VStack>
    </form>
  );
}
