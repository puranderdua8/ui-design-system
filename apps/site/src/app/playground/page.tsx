import type { Metadata } from "next";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Start from a theme, turn the knobs and watch the components change.",
};

const PlaygroundPage = () => <Playground />;

export default PlaygroundPage;
