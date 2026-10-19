import { Stack, Text } from "@puranderdua/ui";

export const Demo = () => (
  <Stack gap="sm">
    <Text variant="body">Body</Text>
    <Text variant="lead">Lead</Text>
    <Text variant="caption">Caption</Text>
    <Text as="span" variant="label">
      Label
    </Text>
  </Stack>
);
