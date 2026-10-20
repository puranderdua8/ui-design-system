import { Field, Input, Stack } from "@puranderdua/ui";

export const Demo = () => (
  <Stack gap="md" className="w-full max-w-sm">
    <Field label="Default" description="Help text is linked to the input.">
      <Input placeholder="Type here" />
    </Field>
    <Field label="Small">
      <Input size="sm" placeholder="Size sm" />
    </Field>
    <Field label="Required" required>
      <Input placeholder="Required" />
    </Field>
    <Field label="Invalid" error="Enter a value.">
      <Input defaultValue="oops" />
    </Field>
    <Field label="Disabled">
      <Input disabled defaultValue="Not editable" />
    </Field>
  </Stack>
);
