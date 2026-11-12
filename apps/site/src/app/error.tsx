"use client";

import { Button, Container, Heading, Stack, Text } from "@puranderdua/ui";

const ErrorPage = ({ reset }: { error: Error; reset: () => void }) => (
  <main id="main" tabIndex={-1} className="py-ds-section-sm">
    <Container size="md">
      <Stack gap="md">
        <Heading as="h1" variant="h1">
          Something went wrong
        </Heading>
        <Text variant="lead">The page could not be shown. Try again.</Text>
        <div>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </Stack>
    </Container>
  </main>
);

export default ErrorPage;
