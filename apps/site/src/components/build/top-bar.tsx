"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Button,
  Checkbox,
  Cluster,
  Container,
  Field,
  Input,
  Link,
  Text,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { isCurrent } from "@/lib/is-current";
import { shuffle } from "@/playground/presets";
import { stepHref } from "@/playground/steps";
import { redo, renameProject, setState, undo } from "@/playground/store";
import { useBuilder } from "./use-builder";

const { shell, buttons, status } = content;

/**
 * The project's name, edited in place. The change is saved when the field loses focus
 * or on Enter; Escape puts the old name back. The parent re-keys it when the name or
 * the project changes, so it never shows a stale draft.
 */
const ProjectName = ({ id, name }: { id: string; name: string }) => {
  const [draft, setDraft] = useState(name);
  const save = () => {
    if (draft.trim() !== name) renameProject(id, draft);
  };
  return (
    <Input
      size="sm"
      aria-label={shell.projectName}
      value={draft}
      maxLength={60}
      className="w-56 font-semibold"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(name);
          event.currentTarget.blur();
        }
      }}
    />
  );
};

const viewLinkClasses =
  "aria-[current=page]:font-semibold aria-[current=page]:underline aria-[current=page]:underline-offset-4";

/**
 * The top bar of every Builder page (spec 4.3): project name, Guided | Studio, Undo,
 * Redo, the status pill and "Use it". It is not pinned, so it never covers a focused
 * control (2.4.11).
 */
export const TopBar = () => {
  const pathname = usePathname();
  const { view, failing } = useBuilder();
  const [keepColours, setKeepColours] = useState(true);
  const current = view.projects.find(
    (project) => project.id === view.currentId,
  );
  const inStudio = isCurrent(pathname, "/build/studio");
  const inGuided = !inStudio && pathname !== "/build";
  return (
    <section
      aria-label={shell.topBarLabel}
      className="border-b border-ds-border py-ds-gap-md"
    >
      <Container size="lg">
        <Cluster justify="between" gap="lg">
          <Cluster gap="md">
            <Link asChild variant="standalone">
              <NextLink
                href="/build"
                aria-current={pathname === "/build" ? "page" : undefined}
                className={viewLinkClasses}
              >
                {shell.projectsTitle}
              </NextLink>
            </Link>
            {current ? (
              <ProjectName
                key={`${current.id}:${current.name}`}
                id={current.id}
                name={current.name}
              />
            ) : null}
          </Cluster>
          <Cluster gap="md">
            <nav aria-label={shell.viewLabel}>
              <Cluster as="ul" gap="md">
                <li>
                  <Link asChild variant="standalone">
                    <NextLink
                      href={stepHref("start")}
                      aria-current={inGuided ? "page" : undefined}
                      className={viewLinkClasses}
                    >
                      {shell.guided}
                    </NextLink>
                  </Link>
                </li>
                <li>
                  <Link asChild variant="standalone">
                    <NextLink
                      href="/build/studio"
                      aria-current={inStudio ? "page" : undefined}
                      className={viewLinkClasses}
                    >
                      {shell.studio}
                    </NextLink>
                  </Link>
                </li>
              </Cluster>
            </nav>
            <Button
              variant="secondary"
              size="sm"
              disabled={!view.canUndo}
              onClick={undo}
            >
              {buttons.undo}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!view.canRedo}
              onClick={redo}
            >
              {buttons.redo}
            </Button>
            <Cluster gap="sm" align="center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setState(shuffle(view.state, { colours: !keepColours }))
                }
              >
                {buttons.tryAnother}
              </Button>
              <Field layout="inline" label={content.shuffle.keepColours}>
                <Checkbox
                  checked={keepColours}
                  onCheckedChange={(checked) =>
                    setKeepColours(checked === true)
                  }
                />
              </Field>
            </Cluster>
            <Text
              role="status"
              data-testid="status-pill"
              className="font-semibold"
            >
              {failing === 0
                ? status.readable
                : failing === 1
                  ? status.fixOne
                  : status.fixMany.replace("{count}", String(failing))}
            </Text>
            <Button asChild size="sm">
              <NextLink href={stepHref("use")}>{buttons.useIt}</NextLink>
            </Button>
          </Cluster>
        </Cluster>
      </Container>
    </section>
  );
};
