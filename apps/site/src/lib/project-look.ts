// One of the person's own projects as the look the examples wear (S51). Loaded on
// demand by the header switcher: it pulls in the four resolved themes and the engine,
// which no other page needs, so the chrome stays light.
import { builderContent } from "@/content/builder";
import { themeMaps } from "@/playground/data";
import { previewVars, safeResolve } from "@/playground/state";
import { getProject } from "@/playground/store";
import {
  activateTheme,
  applyProjectLook,
  beginRequest,
  defaultTheme,
} from "./theme";

/** The name of the group of projects in "Showing examples in" (from the content file). */
export const examplesGroupLabel: string = builderContent.shell.examplesGroup;

/**
 * Makes the examples wear project `id`, as it is now. A project that no longer exists
 * (deleted in this or another tab) leaves the examples in Base. `remember: false`
 * applies it without writing (another tab chose it).
 */
export const activateProject = async (
  id: string,
  { remember = true }: { remember?: boolean } = {},
): Promise<void> => {
  const project = getProject(id);
  if (!project) {
    await activateTheme(defaultTheme, { remember });
    return;
  }
  const request = beginRequest();
  const { resolved } = safeResolve(project.state, themeMaps);
  applyProjectLook(
    request,
    {
      name: project.state.start,
      vars: previewVars(resolved.vars, project.state.fonts),
      project: id,
    },
    remember,
  );
};
