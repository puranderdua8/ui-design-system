import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuilderShell } from "@/components/build/builder-shell";
import { builderContent } from "@/content/builder";
import { getStep, isStepId, stepIds } from "@/playground/steps";

// One URL per step (spec 4.2): Back, Forward and deep links work, and each step has
// its own page title (2.4.2). Anything that is not a step is a 404.
export const dynamicParams = false;

export const generateStaticParams = () => stepIds.map((step) => ({ step }));

type Props = { params: Promise<{ step: string }> };

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { step } = await params;
  if (!isStepId(step)) return {};
  return {
    title: builderContent.shell.stepTitle.replace("{step}", getStep(step).name),
  };
};

const StepPage = async ({ params }: Props) => {
  const { step } = await params;
  if (!isStepId(step)) notFound();
  return <BuilderShell step={step} />;
};

export default StepPage;
