import type { Metadata } from "next";
import { ProjectChooser } from "@/components/build/project-chooser";
import { builderContent } from "@/content/builder";

export const metadata: Metadata = {
  title: builderContent.shell.projectsTitle,
};

const BuildPage = () => <ProjectChooser />;

export default BuildPage;
