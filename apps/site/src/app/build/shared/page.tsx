import type { Metadata } from "next";
import { SharedView } from "@/components/build/shared-view";
import { builderContent } from "@/content/builder";

// A shared design system (S57). It is read in the browser from the part of the URL after
// `#`, which never reaches the server, so this page is the same for every link.
export const metadata: Metadata = {
  title: `${builderContent.shared.title} · ${builderContent.shell.name}`,
};

const SharedPage = () => <SharedView />;

export default SharedPage;
