import {
  Cluster,
  Field,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "@puranderdua/ui";

const plans = [
  { value: "free", label: "Free" },
  { value: "team", label: "Team" },
  { value: "enterprise", label: "Enterprise (sold out)", disabled: true },
];

export const Demo = () => (
  <Field label="Plan" description="Arrow keys move between the options.">
    <RadioGroup defaultValue="free">
      {plans.map(({ value, label, disabled }) => (
        <Cluster key={value} gap="xs" align="center">
          <RadioGroupItem
            value={value}
            id={`plan-${value}`}
            disabled={disabled}
          />
          <Label htmlFor={`plan-${value}`}>{label}</Label>
        </Cluster>
      ))}
    </RadioGroup>
  </Field>
);
