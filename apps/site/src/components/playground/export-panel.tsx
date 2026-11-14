"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Cluster,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from "@puranderdua/ui";
import { exportTheme, themeSlug, type ExportFile } from "@/playground/export";
import type { ContrastReport, ResolvedTheme } from "@/playground/types";

const download = (file: ExportFile): void => {
  const url = URL.createObjectURL(
    new Blob([file.content], { type: file.mime }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
};

export const ExportPanel = ({
  resolved,
  report,
}: {
  resolved: ResolvedTheme;
  report: ContrastReport;
}) => {
  const [name, setName] = useState("custom");
  // Which file was last copied, for the status line.
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const slug = themeSlug(name);
  const { files, unrepresentable } = useMemo(
    () => exportTheme(resolved, slug),
    [resolved, slug],
  );

  const copy = async (file: ExportFile) => {
    try {
      await navigator.clipboard.writeText(file.content);
      setFailed(false);
      setCopied(file.name);
    } catch {
      setCopied(null);
      setFailed(true);
    }
  };

  return (
    <Stack gap="md">
      <Heading as="h2" variant="h3">
        Export
      </Heading>
      <Text>
        Put the four JSON files in <code>tokens/themes/{slug}/</code>, list them
        under a <code>{slug}</code> theme in <code>tokens/resolver.json</code>,
        then run <code>pnpm tokens:build</code>. The CSS file is what a consumer
        imports after <code>foundations.css</code>.
      </Text>
      <Field label="Theme name">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      {report.failing > 0 ? (
        <Text data-testid="export-contrast-warning" role="status">
          {report.failing} contrast{" "}
          {report.failing === 1 ? "pair fails" : "pairs fail"}. The export
          works, but <code>pnpm tokens:check</code> will reject this theme until
          they pass.
        </Text>
      ) : null}
      {unrepresentable.length > 0 ? (
        <Text data-testid="export-semantic-warning" role="status">
          {unrepresentable.length} advanced{" "}
          {unrepresentable.length === 1 ? "override is" : "overrides are"} not
          in the export, because semantic tokens are shared by every theme:{" "}
          {unrepresentable.map((key) => key.replace(/^--ds-/, "")).join(", ")}.
        </Text>
      ) : null}
      <ul
        className="flex flex-col gap-ds-gap-sm"
        role="list"
        aria-label="Export files"
      >
        {files.map((file) => (
          <li
            key={file.name}
            className="flex flex-wrap items-center justify-between gap-ds-gap-sm"
          >
            <code className="min-w-0 break-all">{file.name}</code>
            <Cluster gap="sm">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copy(file)}
                aria-label={`Copy ${file.name}`}
              >
                Copy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => download(file)}
                aria-label={`Download ${file.name}`}
              >
                Download
              </Button>
            </Cluster>
          </li>
        ))}
      </ul>
      <Button
        onClick={() => files.forEach(download)}
        data-testid="export-download-all"
      >
        Download all {files.length} files
      </Button>
      <Text role="status" data-testid="export-status">
        {copied
          ? `Copied ${copied}.`
          : failed
            ? "Copying was blocked by the browser."
            : ""}
      </Text>
    </Stack>
  );
};
