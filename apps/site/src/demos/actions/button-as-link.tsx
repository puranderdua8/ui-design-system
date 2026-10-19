import NextLink from "next/link";
import { Button } from "@puranderdua/ui";

export const Demo = () => (
  <Button variant="secondary" asChild>
    <NextLink href="/components">All components</NextLink>
  </Button>
);
