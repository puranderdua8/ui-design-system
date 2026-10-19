import { Grid, Stack } from "@puranderdua/ui";
import { Box } from "@/demos/box";

export const Demo = () => (
  <Stack gap="md">
    <Grid cols={3} gap="sm">
      <Box>One</Box>
      <Box>Two</Box>
      <Box>Three</Box>
    </Grid>
    <Grid minItemWidth="sm" gap="sm">
      <Box>Fit one</Box>
      <Box>Fit two</Box>
      <Box>Fit three</Box>
      <Box>Fit four</Box>
    </Grid>
  </Stack>
);
