import { Sidebar } from "@puranderdua/ui";
import { Box } from "@/demos/box";

export const Demo = () => (
  <Sidebar sidebar={<Box>Sidebar</Box>} gap="sm">
    <Box>Content</Box>
  </Sidebar>
);
