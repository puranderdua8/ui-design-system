"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import NextLink from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Cluster,
  Container,
  Field,
  Grid,
  Heading,
  Input,
  Stack,
  Text,
  ThemeScope,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { evaluateContrast } from "@/playground/contrast";
import { contrastSpec, themeMaps } from "@/playground/data";
import {
  decodeShare,
  readShareHash,
  type DecodedShare,
} from "@/playground/share";
import {
  fontName,
  guideColours,
  guideDepths,
  guideMotions,
  guideShapes,
  guideSpaces,
  readSummary,
} from "@/playground/guide";
import { previewVars, safeResolve } from "@/playground/state";
import { stepHref } from "@/playground/steps";
import { useBuilder } from "./use-builder";

const { guide, errors, shared } = content;

/** Where the design comes from: not read yet, the open project, or a link. */
type Source = { kind: "loading" } | { kind: "project" } | DecodedShare;

const Section = ({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children?: ReactNode;
}) => (
  // A section stays on one printed page where it fits.
  <section data-print="keep" className="break-inside-avoid">
    <Stack gap="md">
      <Stack gap="sm">
        <Heading as="h2" variant="h2">
          {title}
        </Heading>
        <Text>{lead}</Text>
      </Stack>
      {children}
    </Stack>
  </section>
);

/**
 * The style guide (spec 4.6, item 2): the project's name, colours with plain names, hex
 * values and "use for", type specimens, shape, spacing, shadows, motion, sample parts, an
 * accessibility summary and the credit, all inside one `ThemeScope`. It shows the open
 * project, or a shared design when the link carries one (`#d=…`, decoded with the same
 * size caps and value grammar as the shared view). Every value shown has passed the
 * grammar. "Save as PDF" is the browser's print; the print rules in `globals.css` take
 * the tool's chrome away.
 */
export const GuideView = () => {
  const own = useBuilder();
  const [source, setSource] = useState<Source>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    const read = async () => {
      const text = readShareHash(window.location.hash);
      const next: Source =
        text === null ? { kind: "project" } : await decodeShare(text);
      if (!cancelled) setSource(next);
    };
    void read();
    const again = () => void read();
    window.addEventListener("hashchange", again);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", again);
    };
  }, []);

  const linked = source.kind === "ok";
  const linkedResolved = useMemo(
    () => (source.kind === "ok" ? safeResolve(source.state, themeMaps) : null),
    [source],
  );
  const current = own.view.projects.find(
    (project) => project.id === own.view.currentId,
  );
  const name = linked ? guide.title : current?.name.trim() || guide.untitled;
  const state = source.kind === "ok" ? source.state : own.view.state;
  const resolved = linkedResolved?.resolved ?? own.resolved;
  const vars = useMemo(
    () => previewVars(resolved.vars, state.fonts),
    [resolved, state.fonts],
  );
  const failing = useMemo(
    () =>
      evaluateContrast(resolved.vars, contrastSpec).results.filter(
        (result) => !result.ok,
      ).length,
    [resolved],
  );

  const back = (
    <Button asChild variant="secondary" size="sm">
      <NextLink href={linked ? "/build" : stepHref("use")}>
        {linked ? content.shell.projectsTitle : guide.back}
      </NextLink>
    </Button>
  );

  return (
    <main
      id="main"
      tabIndex={-1}
      data-testid="guide"
      data-state={source.kind}
      className="py-ds-section-sm"
    >
      <Container size="lg">
        <Stack gap="lg">
          {source.kind === "loading" ? (
            <Text role="status">{guide.loading}</Text>
          ) : null}
          {source.kind === "invalid" || source.kind === "newer" ? (
            <Stack gap="md" data-testid="guide-problem">
              <Heading as="h1" variant="h2">
                {guide.title}
              </Heading>
              <Text role="alert">
                {source.kind === "newer"
                  ? shared.newer
                  : `${errors.linkBroken.message} ${errors.linkBroken.fix}`}
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
          {source.kind === "ok" || source.kind === "project" ? (
            <>
              {/* The tool's own controls: never printed. */}
              <Stack gap="sm" data-print="hide" data-testid="guide-toolbar">
                {linked ? <Text>{guide.sharedNote}</Text> : null}
                <Cluster gap="md" align="center">
                  <Button size="sm" onClick={() => window.print()}>
                    {guide.print}
                  </Button>
                  {back}
                </Cluster>
                <Text variant="caption">{guide.printHint}</Text>
              </Stack>

              <ThemeScope
                theme={state.start}
                vars={vars}
                data-testid="guide-scope"
                data-guide-scope=""
                className="ds-tone-canvas ds-border rounded-ds-card border-ds-border p-ds-gap-lg font-ds-body print:border-0 print:p-0"
              >
                <Stack gap="xl">
                  <Stack gap="sm">
                    <Heading as="h1" variant="h1" data-testid="guide-name">
                      {name}
                    </Heading>
                    <Text variant="lead">{guide.lead}</Text>
                  </Stack>

                  <Section title={guide.colourTitle} lead={guide.colourLead}>
                    <Grid
                      minItemWidth="md"
                      gap="md"
                      as="ul"
                      className="m-0 list-none p-0"
                    >
                      {guideColours(vars).map((colour) => (
                        <li
                          key={colour.name}
                          data-testid="guide-colour"
                          className="break-inside-avoid"
                        >
                          <Stack gap="sm">
                            <div
                              data-swatch=""
                              aria-hidden="true"
                              className="ds-border h-16 rounded-ds-card border-ds-border"
                              style={{ backgroundColor: colour.hex }}
                            />
                            <Text className="font-semibold">{colour.name}</Text>
                            <Text variant="caption">
                              <code>{colour.hex}</code>
                            </Text>
                            <Text variant="caption">
                              {guide.useFor}: {colour.useFor}
                            </Text>
                          </Stack>
                        </li>
                      ))}
                    </Grid>
                  </Section>

                  <Section title={guide.typeTitle} lead={guide.typeLead}>
                    <Stack gap="md">
                      <Text variant="caption">
                        {guide.headingFont}:{" "}
                        {fontName(resolved.vars["--ds-font-family-heading"]) ??
                          "-"}
                      </Text>
                      <Heading as="h3" variant="display">
                        {guide.specimenHeading}
                      </Heading>
                      <Heading as="h3" variant="h2">
                        {guide.specimenHeading}
                      </Heading>
                      <Text variant="caption">
                        {guide.bodyFont}:{" "}
                        {fontName(resolved.vars["--ds-font-family-body"]) ??
                          "-"}
                      </Text>
                      <Text variant="lead">{guide.specimenBody}</Text>
                      <Text>{guide.specimenBody}</Text>
                      <Text variant="caption">{guide.specimenCaption}</Text>
                    </Stack>
                  </Section>

                  <Section title={guide.shapeTitle} lead={guide.shapeLead}>
                    <Cluster gap="lg" align="end">
                      {guideShapes(vars).map((shape) => (
                        <Stack gap="sm" key={shape.name} align="center">
                          <div
                            data-print="keep"
                            className="ds-border h-16 w-24 border-ds-border bg-ds-subtle"
                            style={{ borderRadius: shape.value }}
                          />
                          <Text variant="caption">{shape.name}</Text>
                          <Text variant="caption">
                            <code>{shape.value}</code>
                          </Text>
                        </Stack>
                      ))}
                    </Cluster>
                  </Section>

                  <Section title={guide.spacingTitle} lead={guide.spacingLead}>
                    <Stack gap="sm">
                      {guideSpaces(vars).map((space) => (
                        <Cluster gap="md" align="center" key={space.name}>
                          <div
                            className="h-4 max-w-full shrink-0 bg-ds-subtle ds-border border-ds-border"
                            style={{ width: space.value }}
                          />
                          <Text variant="caption">
                            {space.name}: <code>{space.value}</code>
                          </Text>
                        </Cluster>
                      ))}
                    </Stack>
                  </Section>

                  <Section title={guide.depthTitle} lead={guide.depthLead}>
                    <Cluster gap="lg">
                      {guideDepths(vars).map((depth) => (
                        <Stack gap="sm" key={depth.name} align="center">
                          <div
                            className="h-16 w-28 rounded-ds-card bg-ds-canvas"
                            style={{ boxShadow: depth.value }}
                          />
                          <Text variant="caption">{depth.name}</Text>
                        </Stack>
                      ))}
                    </Cluster>
                  </Section>

                  <Section title={guide.motionTitle} lead={guide.motionLead}>
                    <Stack gap="sm">
                      {guideMotions(vars).map((motion) => (
                        <Text key={motion.name}>
                          {motion.name}: <code>{motion.value}</code>
                        </Text>
                      ))}
                    </Stack>
                  </Section>

                  <Section title={guide.partsTitle} lead={guide.partsLead}>
                    <Stack gap="md">
                      <Cluster gap="md">
                        <Button>{guide.sampleButton}</Button>
                        <Button variant="secondary">
                          {guide.sampleSecondary}
                        </Button>
                      </Cluster>
                      <Field
                        label={guide.sampleFieldLabel}
                        description={guide.sampleFieldHint}
                      >
                        <Input readOnly defaultValue="name@example.com" />
                      </Field>
                      <Field layout="inline" label={guide.sampleCheckbox}>
                        <Checkbox defaultChecked />
                      </Field>
                      <Card variant="raised" className="max-w-sm">
                        <CardHeader>
                          <CardTitle>{guide.sampleCardTitle}</CardTitle>
                          <CardDescription>
                            {guide.sampleCardBody}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button size="sm">{guide.sampleCardAction}</Button>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Section>

                  <Section
                    title={guide.readTitle}
                    lead={readSummary(failing)}
                  />

                  <footer data-testid="guide-credit">
                    <Text variant="caption">{guide.credit}</Text>
                  </footer>
                </Stack>
              </ThemeScope>
            </>
          ) : null}
        </Stack>
      </Container>
    </main>
  );
};
