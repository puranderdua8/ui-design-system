"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Button,
  Cluster,
  Container,
  Heading,
  Stack,
  Text,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { Preview } from "@/components/playground/preview";
import { themeMaps } from "@/playground/data";
import {
  decodeShare,
  readShareHash,
  type DecodedShare,
} from "@/playground/share";
import { previewVars, safeResolve } from "@/playground/state";
import { stepHref } from "@/playground/steps";
import { saveCopy } from "@/playground/store";

const { shared, buttons, status, errors, shell } = content;

type Reading = { kind: "loading" } | DecodedShare;

/**
 * A shared design system, read-only (spec 4.6, 5.3). The link is untrusted: it is decoded
 * with size caps and passed through the value grammar before anything is shown. It is
 * labelled as someone else's work, it never touches the person's own projects, and
 * "Save a copy" only ever adds a new one. Nothing is read from the server: the design
 * is in the part of the URL after `#`.
 */
export const SharedView = () => {
  const [reading, setReading] = useState<Reading>({ kind: "loading" });
  const [saved, setSaved] = useState<"no" | "yes" | "full">("no");
  /** The link's own hash, passed on to the style guide. Only set once it has been read. */
  const [hash, setHash] = useState("");

  useEffect(() => {
    let cancelled = false;
    const read = async () => {
      const text = readShareHash(window.location.hash);
      if (text !== null) setHash(`#d=${text}`);
      const result: DecodedShare =
        text === null ? { kind: "invalid" } : await decodeShare(text);
      if (!cancelled) setReading(result);
    };
    void read();
    const again = () => void read();
    window.addEventListener("hashchange", again);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", again);
    };
  }, []);

  const state = reading.kind === "ok" ? reading.state : null;
  const { resolved } = useMemo(
    () =>
      state
        ? safeResolve(state, themeMaps)
        : {
            resolved: null as null | ReturnType<typeof safeResolve>["resolved"],
          },
    [state],
  );
  const vars = useMemo(
    () => (resolved && state ? previewVars(resolved.vars, state.fonts) : null),
    [resolved, state],
  );

  const skip =
    "sr-only ds-focus-ring text-ds-link focus:not-sr-only focus:bg-ds-canvas focus:px-ds-gap-md focus:py-ds-gap-sm";

  return (
    <main
      id="main"
      tabIndex={-1}
      data-testid="shared-view"
      data-state={reading.kind}
      className="py-ds-section-sm"
    >
      <Container size="lg">
        <Stack gap="lg">
          <Heading as="h1" variant="h2">
            {shared.title}
          </Heading>
          {reading.kind === "loading" ? (
            <Text role="status">{shared.loading}</Text>
          ) : null}
          {reading.kind === "invalid" ? (
            <Stack gap="md" data-testid="shared-problem">
              <Text role="alert">
                {errors.linkBroken.message} {errors.linkBroken.fix}
              </Text>
              <Cluster gap="md">
                <Button asChild size="sm">
                  <NextLink href={stepHref("start")}>
                    {shared.startOwn}
                  </NextLink>
                </Button>
              </Cluster>
            </Stack>
          ) : null}
          {reading.kind === "newer" ? (
            <Stack gap="md" data-testid="shared-problem">
              <Text role="alert">{shared.newer}</Text>
              <Cluster gap="md">
                <Button asChild size="sm">
                  <NextLink href={stepHref("start")}>
                    {shared.startOwn}
                  </NextLink>
                </Button>
              </Cluster>
            </Stack>
          ) : null}
          {state && vars ? (
            <>
              <div
                data-testid="shared-label"
                className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
              >
                <Stack gap="sm">
                  <Text className="font-semibold">{status.sharedView}</Text>
                  <Text>{shared.readOnly}</Text>
                  <Cluster gap="md" align="center">
                    <Button
                      size="sm"
                      onClick={() =>
                        setSaved(
                          saveCopy(shared.copyName, state) ? "yes" : "full",
                        )
                      }
                    >
                      {buttons.saveCopy}
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      {/* The style guide reads the same link, so it opens this design. */}
                      <NextLink href={`/build/guide${hash}`}>
                        {content.use.openGuide}
                      </NextLink>
                    </Button>
                    {saved === "yes" ? (
                      <Text role="status" data-testid="shared-saved">
                        {shared.saved}{" "}
                        <NextLink
                          href={stepHref("start")}
                          className="ds-focus-ring text-ds-link underline"
                        >
                          {shared.savedOpen}
                        </NextLink>
                      </Text>
                    ) : null}
                    {saved === "full" ? (
                      <Text role="status">{shared.full}</Text>
                    ) : null}
                  </Cluster>
                </Stack>
              </div>
              <a href="#preview" className={skip}>
                {shell.skipToPreview}
              </a>
              <section
                id="preview"
                tabIndex={-1}
                aria-label={shell.previewLabel}
              >
                <Preview theme={state.start} vars={vars} />
              </section>
            </>
          ) : null}
        </Stack>
      </Container>
    </main>
  );
};
