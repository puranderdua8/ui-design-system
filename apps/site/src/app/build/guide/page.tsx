import type { Metadata } from "next";
import { GuideView } from "@/components/build/guide-view";
import { builderContent } from "@/content/builder";

// The style guide (S58). It reads the open project, or a shared design from the part of
// the URL after `#`, in the browser, so this page is the same for every visitor.
export const metadata: Metadata = {
  title: `${builderContent.guide.title} · ${builderContent.shell.name}`,
};

const GuidePage = () => <GuideView />;

export default GuidePage;
