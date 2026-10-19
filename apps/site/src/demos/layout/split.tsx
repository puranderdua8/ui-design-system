import { Split } from "@puranderdua/ui";
import { Box } from "@/demos/box";

export const Demo = () => (
  <Split ratio="1:2" gap="sm">
    <Box>One part</Box>
    <Box>Two parts</Box>
  </Split>
);
