import { Checkbox, Cluster, Label, Stack } from "@puranderdua/ui";

const states = [
  { id: "cb-off", label: "Unchecked", props: {} },
  { id: "cb-on", label: "Checked", props: { defaultChecked: true } },
  {
    id: "cb-mixed",
    label: "Indeterminate",
    props: { checked: "indeterminate" as const },
  },
  { id: "cb-invalid", label: "Invalid", props: { "aria-invalid": true } },
  { id: "cb-disabled", label: "Disabled", props: { disabled: true } },
];

export const Demo = () => (
  <Stack gap="sm">
    {states.map(({ id, label, props }) => (
      <Cluster key={id} gap="xs" align="center">
        <Checkbox id={id} {...props} />
        <Label htmlFor={id}>{label}</Label>
      </Cluster>
    ))}
  </Stack>
);
