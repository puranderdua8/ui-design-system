"use client";

import { useMemo, useState, type ReactNode } from "react";
import NextLink from "next/link";
import {
  Button,
  Cluster,
  Field,
  Heading,
  Input,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { downloadText } from "@/lib/download";
import { fontSnippet } from "@/playground/formats/font-snippet";
import { toCssVars } from "@/playground/formats/css-vars";
import { toDtcgFile } from "@/playground/formats/dtcg-file";
import { toPackageCss } from "@/playground/formats/package-css";
import { shareUrl } from "@/playground/share";
import { stepHref } from "@/playground/steps";
import type { PlaygroundState, ResolvedTheme } from "@/playground/types";

const { use, buttons, status } = content;

type File = { name: string; mime: string; content: string };

/** Runs an export. A value the grammar refuses throws; the step then shows no file. */
const make = <T,>(run: () => T): T | null => {
  try {
    return run();
  } catch {
    return null;
  }
};

/** One file: its name, Copy and Download. `done` says what the last copy did. */
const FileRow = ({
  file,
  testId,
  onCopy,
  done,
}: {
  file: File;
  testId: string;
  onCopy: (text: string) => void;
  done: string;
}) => (
  <Stack gap="sm" data-testid={testId}>
    <Cluster gap="md" align="center" justify="between">
      <code className="min-w-0 break-all">{file.name}</code>
      <Cluster gap="sm">
        <Button
          variant="secondary"
          size="sm"
          aria-label={`${buttons.copy} ${file.name}`}
          onClick={() => onCopy(file.content)}
        >
          {buttons.copy}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          aria-label={`${buttons.download} ${file.name}`}
          onClick={() => downloadText(file.name, file.mime, file.content)}
        >
          {buttons.download}
        </Button>
      </Cluster>
    </Cluster>
    <Text variant="caption" role="status">
      {done}
    </Text>
  </Stack>
);

const Steps = ({ lines }: { lines: readonly string[] }) => (
  <ol className="m-0 flex list-decimal flex-col gap-ds-gap-sm pl-ds-gap-lg">
    {lines.map((line) => (
      <li key={line}>{line}</li>
    ))}
  </ol>
);

/** The `<link>` line for the design's fonts, with Copy, or a line saying none is needed. */
const Fonts = ({
  snippet,
  onCopy,
  done,
}: {
  snippet: string | null;
  onCopy: (text: string) => void;
  done: string;
}) => (
  <Stack gap="sm" data-testid="font-snippet">
    <Heading as="h3" variant="h3">
      {use.fontsTitle}
    </Heading>
    {snippet === null ? (
      <Text>{use.fontsNone}</Text>
    ) : (
      <>
        <Text>{use.fontsLead}</Text>
        <pre
          tabIndex={0}
          aria-label={use.fontsTitle}
          className="ds-border m-0 overflow-x-auto rounded-ds-card border-ds-border bg-ds-subtle p-ds-gap-md"
        >
          <code>{snippet}</code>
        </pre>
        <Cluster gap="sm" align="center">
          <Button
            variant="secondary"
            size="sm"
            aria-label={`${buttons.copy} ${use.fontsTitle}`}
            onClick={() => onCopy(snippet)}
          >
            {buttons.copy}
          </Button>
          <Text variant="caption" role="status">
            {done}
          </Text>
        </Cluster>
        <Text variant="caption">{use.fontsOwnNote}</Text>
      </>
    )}
  </Stack>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Stack gap="sm">
    <Heading as="h3" variant="h3">
      {title}
    </Heading>
    {children}
  </Stack>
);

/**
 * The Use it step (spec 4.6): share a snapshot link, open the style guide, take the
 * design file, and build with the CSS variables or `@puranderdua/ui`. Every file is
 * made from the resolved design and re-checked by the grammar on its way out.
 */
export const UseStep = ({
  state,
  resolved,
  name,
  failing,
}: {
  state: PlaygroundState;
  resolved: ResolvedTheme;
  /** The project's name, which the files are named after. */
  name: string;
  failing: number;
}) => {
  const [link, setLink] = useState<string | null>(null);
  const [linkNote, setLinkNote] = useState("");
  /** Which control last copied, and how it went. */
  const [copied, setCopied] = useState<{ key: string; text: string }>({
    key: "",
    text: "",
  });

  const css = useMemo(
    () =>
      make(() => ({
        name: "design-system.css",
        mime: "text/css",
        content: toCssVars(resolved),
      })),
    [resolved],
  );
  const pkg = useMemo(
    () => make(() => toPackageCss(resolved, name)),
    [resolved, name],
  );
  const design = useMemo(
    () => make(() => toDtcgFile(resolved, name)),
    [resolved, name],
  );
  const snippet = useMemo(() => make(() => fontSnippet(resolved)), [resolved]);

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ key, text: use.fileCopied });
    } catch {
      setCopied({ key, text: use.fileCopyFailed });
    }
  };
  const doneFor = (key: string) => (copied.key === key ? copied.text : "");

  const copyLink = async () => {
    let url: string;
    try {
      url = await shareUrl(window.location.origin, state);
    } catch {
      setLink(null);
      setLinkNote(use.linkTooBig);
      return;
    }
    setLink(url);
    try {
      await navigator.clipboard.writeText(url);
      setLinkNote(use.linkCopied);
    } catch {
      setLinkNote(use.linkCopyFailed);
    }
  };

  return (
    <Stack gap="lg">
      {failing > 0 ? (
        <div
          data-testid="use-banner"
          className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
        >
          <Text>
            {use.banner}{" "}
            <NextLink
              href={stepHref("check")}
              className="ds-focus-ring text-ds-link underline"
            >
              {use.bannerFix}
            </NextLink>
            . {use.bannerKeep}
          </Text>
        </div>
      ) : null}

      <Section title={use.shareTitle}>
        <Text>{use.shareLead}</Text>
        <Text variant="caption">{status.snapshot}</Text>
        <Cluster gap="sm" align="center">
          <Button size="sm" onClick={copyLink}>
            {buttons.copyLink}
          </Button>
          <Text variant="caption" role="status" data-testid="link-note">
            {linkNote}
          </Text>
        </Cluster>
        {link ? (
          <Field label={use.linkLabel}>
            <Input
              readOnly
              value={link}
              data-testid="share-link"
              onFocus={(event) => event.currentTarget.select()}
            />
          </Field>
        ) : null}
      </Section>

      <Section title={use.guideTitle}>
        <Text>{use.guideLead}</Text>
        <Cluster gap="sm">
          <Button asChild variant="secondary" size="sm">
            <NextLink href="/build/guide">{use.openGuide}</NextLink>
          </Button>
        </Cluster>
      </Section>

      <Section title={use.designTitle}>
        <Text>{use.designLead}</Text>
        {design ? (
          <FileRow
            file={design}
            testId="file-design"
            onCopy={(text) => copy("design", text)}
            done={doneFor("design")}
          />
        ) : null}
        <Text variant="caption">{use.designNote}</Text>
      </Section>

      <Section title={use.buildTitle}>
        <Text>{use.buildLead}</Text>
        <Tabs defaultValue="css" className="w-full">
          <TabsList aria-label={use.tabsLabel}>
            <TabsTrigger value="css">{use.tabCss}</TabsTrigger>
            <TabsTrigger value="package">{use.tabPackage}</TabsTrigger>
          </TabsList>
          <TabsContent value="css">
            <Stack gap="md">
              <Text>{use.cssNote}</Text>
              <Steps lines={use.cssSteps} />
              {css ? (
                <FileRow
                  file={css}
                  testId="file-css"
                  onCopy={(text) => copy("css", text)}
                  done={doneFor("css")}
                />
              ) : null}
              <Fonts
                snippet={snippet}
                onCopy={(text) => copy("fonts-css", text)}
                done={doneFor("fonts-css")}
              />
            </Stack>
          </TabsContent>
          <TabsContent value="package">
            <Stack gap="md">
              <Text>{use.packageNote}</Text>
              <Steps lines={use.packageSteps} />
              {pkg ? (
                <FileRow
                  file={pkg}
                  testId="file-package"
                  onCopy={(text) => copy("package", text)}
                  done={doneFor("package")}
                />
              ) : null}
              <Fonts
                snippet={snippet}
                onCopy={(text) => copy("fonts-package", text)}
                done={doneFor("fonts-package")}
              />
            </Stack>
          </TabsContent>
        </Tabs>
      </Section>
    </Stack>
  );
};
