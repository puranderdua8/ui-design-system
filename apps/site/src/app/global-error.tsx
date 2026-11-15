"use client";

// Replaces the root layout when it throws, so it renders its own <html> and
// <body> and imports the styles itself (R34). It sits outside the layout's font
// setup: the system sans stack from the Base theme applies.
import { useEffect } from "react";
import { Button, Container, Heading, Stack, Text } from "@puranderdua/ui";
import "./globals.css";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <main id="main" tabIndex={-1} className="py-ds-section-sm">
          <Container size="md">
            <Stack gap="md">
              <Heading as="h1" variant="h1">
                Something went wrong
              </Heading>
              <Text variant="lead">
                The site could not be shown. Try again.
              </Text>
              {error.digest ? (
                <Text variant="caption">Error reference: {error.digest}</Text>
              ) : null}
              <div>
                <Button onClick={() => reset()}>Try again</Button>
              </div>
            </Stack>
          </Container>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
