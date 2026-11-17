import type { Metadata } from "next";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Pick a starting look, change it to suit you and watch the examples update.",
};

const PlaygroundPage = () => <Playground />;

export default PlaygroundPage;
