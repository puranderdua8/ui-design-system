import {
  Field,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Stack,
} from "@puranderdua/ui";

const Options = () => (
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruit</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="cherry" disabled>
        Cherry (sold out)
      </SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Vegetables</SelectLabel>
      <SelectItem value="carrot">Carrot</SelectItem>
      <SelectItem value="leek">Leek</SelectItem>
    </SelectGroup>
  </SelectContent>
);

export const Demo = () => (
  <Stack gap="md" className="w-full max-w-sm">
    <Field label="Produce" description="Open with Enter or the arrow keys.">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick produce" />
        </SelectTrigger>
        <Options />
      </Select>
    </Field>
    <Field label="Small">
      <Select defaultValue="banana">
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <Options />
      </Select>
    </Field>
    <Field label="Invalid" error="Pick something.">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick produce" />
        </SelectTrigger>
        <Options />
      </Select>
    </Field>
    <Field label="Disabled">
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Unavailable" />
        </SelectTrigger>
        <Options />
      </Select>
    </Field>
  </Stack>
);
