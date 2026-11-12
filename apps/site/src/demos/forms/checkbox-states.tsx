import { Checkbox, Field, Stack } from "@puranderdua/ui";

export const Demo = () => (
  <Stack gap="sm">
    <Field layout="inline" label="Unchecked">
      <Checkbox />
    </Field>
    <Field layout="inline" label="Checked">
      <Checkbox defaultChecked />
    </Field>
    <Field layout="inline" label="Indeterminate">
      <Checkbox checked="indeterminate" />
    </Field>
    <Field layout="inline" label="Invalid" error="Accept to continue.">
      <Checkbox />
    </Field>
    <Field layout="inline" label="Disabled">
      <Checkbox disabled />
    </Field>
  </Stack>
);
