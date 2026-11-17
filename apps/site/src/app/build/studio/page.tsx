import type { Metadata } from "next";
import { Playground } from "@/components/playground/playground";
import { builderContent } from "@/content/builder";

export const metadata: Metadata = {
  title: `${builderContent.shell.studioTitle} · ${builderContent.shell.name}`,
};

// Today's four panels, unchanged (S51). Studio becomes its own view after launch.
const StudioPage = () => <Playground />;

export default StudioPage;
