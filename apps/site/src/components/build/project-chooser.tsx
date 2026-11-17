"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Cluster,
  Container,
  Field,
  Heading,
  Input,
  Stack,
  Text,
} from "@puranderdua/ui";
import { builderContent as content } from "@/content/builder";
import { stepHref } from "@/playground/steps";
import {
  duplicateProject,
  newProject,
  openProject,
  removeProject,
  renameProject,
} from "@/playground/store";
import { useBuilder } from "./use-builder";

const { shell, buttons, errors } = content;

type Row = { id: string; name: string };

const ProjectRow = ({
  project,
  current,
}: {
  project: Row;
  current: boolean;
}) => {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(project.name);

  const save = () => {
    renameProject(project.id, draft);
    setRenaming(false);
  };

  return (
    <li className="ds-border rounded-ds-card border-ds-border p-ds-gap-md">
      <Stack gap="sm">
        {renaming ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <Stack gap="sm">
              <Field label={shell.chooser.renameLabel}>
                <Input
                  value={draft}
                  maxLength={60}
                  autoFocus
                  onChange={(event) => setDraft(event.target.value)}
                />
              </Field>
              <Cluster gap="sm">
                <Button type="submit" size="sm">
                  {buttons.rename}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRenaming(false)}
                >
                  {buttons.cancel}
                </Button>
              </Cluster>
            </Stack>
          </form>
        ) : (
          <>
            <Cluster gap="sm" align="center">
              <Text className="font-semibold" data-testid="project-name">
                {project.name}
              </Text>
              {current ? (
                <Text variant="caption">{shell.chooser.current}</Text>
              ) : null}
            </Cluster>
            <Cluster gap="sm">
              <Button
                size="sm"
                onClick={() => {
                  openProject(project.id);
                  router.push(stepHref("start"));
                }}
              >
                {shell.chooser.open}
                <span className="sr-only"> {project.name}</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDraft(project.name);
                  setRenaming(true);
                }}
              >
                {buttons.rename}
                <span className="sr-only"> {project.name}</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => duplicateProject(project.id)}
              >
                {buttons.duplicate}
                <span className="sr-only"> {project.name}</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    {buttons.delete}
                    <span className="sr-only"> {project.name}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {errors.deleteProject.message}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {project.name}. {errors.deleteProject.fix}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{buttons.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removeProject(project.id)}
                    >
                      {shell.chooser.deleteConfirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Cluster>
          </>
        )}
      </Stack>
    </li>
  );
};

/** `/build`: continue a project or start a new one (spec 4.2, 4.9). */
export const ProjectChooser = () => {
  const router = useRouter();
  const { view, hydrated } = useBuilder();
  return (
    <main
      id="main"
      tabIndex={-1}
      data-hydrated={hydrated}
      className="py-ds-section-sm"
    >
      <Container size="md">
        <Stack gap="lg">
          <Stack gap="sm">
            <Heading as="h1" variant="h1">
              {shell.projectsTitle}
            </Heading>
            <Text variant="lead">{shell.chooser.lead}</Text>
          </Stack>
          {view.storage === "blocked" || view.storage === "full" ? (
            <div
              role="status"
              className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
            >
              {view.storage === "blocked"
                ? `${errors.storageBlocked.message} ${errors.storageBlocked.fix}`
                : `${errors.storageFull.message} ${errors.storageFull.fix}`}
            </div>
          ) : null}
          <ul
            aria-label={shell.chooser.list}
            className="m-0 flex list-none flex-col gap-ds-gap-md p-0"
          >
            {view.projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                current={project.id === view.currentId}
              />
            ))}
          </ul>
          <div>
            <Button
              onClick={() => {
                newProject();
                router.push(stepHref("start"));
              }}
            >
              {shell.chooser.newProject}
            </Button>
          </div>
        </Stack>
      </Container>
    </main>
  );
};
