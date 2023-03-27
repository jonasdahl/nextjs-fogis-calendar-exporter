import {
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import * as t from "io-ts";
import Head from "next/head";
import { FormEvent, useRef, useState } from "react";
import { useMutation } from "react-query";

export default function Home() {
  const {
    isLoading,
    mutate,
    error,
    data: link,
    reset,
  } = useMutation(
    async ({
      username,
      password,
      addTravel,
      timeAfter,
      timeBefore,
    }: {
      username: string;
      password: string;
      addTravel: boolean;
      timeBefore: number;
      timeAfter: number;
    }) => {
      const res = await fetch("/api/v1/generate", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          addTravel,
          timeBefore,
          timeAfter,
        }),
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

  const handleSubmit = (args: {
    username: string;
    password: string;
    addTravel: boolean;
    timeBefore: number;
    timeAfter: number;
  }) => {
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
  onSubmit: (args: {
    username: string;
    password: string;
    addTravel: boolean;
    timeBefore: number;
    timeAfter: number;
  }) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [addTravel, setAddTravel] = useState(false);

  const timeBeforeRef = useRef<HTMLInputElement>(null);
  const timeAfterRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      password,
      username,
      addTravel,
      timeBefore: Number(timeBeforeRef.current?.value) || 0,
      timeAfter: Number(timeAfterRef.current?.value) || 0,
    });
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
        <FormControl>
          <FormLabel>Tid före match (minuter)</FormLabel>
          <Input
            ref={timeBeforeRef}
            name="timeBefore"
            type="number"
            defaultValue={0}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Tid efter match (minuter)</FormLabel>
          <Input
            ref={timeAfterRef}
            name="timeAfter"
            type="number"
            defaultValue={0}
          />
        </FormControl>
        <FormControl>
          <Checkbox
            checked={addTravel}
            onChange={(e) => setAddTravel(e.target.checked)}
          >
            <Tooltip
              openDelay={1000}
              hasArrow
              label="Om det går att hitta en väg från din adress till matchen kommer den läggas till i kalendern. Avmarkera om det inte fungerar bra."
            >
              Försök lägga till bilresor via Google Maps i kalendern
            </Tooltip>
          </Checkbox>
        </FormControl>
        <Button type="submit" isLoading={isLoading}>
          Generera ICal-länk
        </Button>
      </VStack>
    </form>
  );
}
