import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Cluster,
  Field,
  Fieldset,
  Heading,
  Input,
  RadioCard,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@puranderdua/ui";

/** A settings screen: a profile card, how it looks, a plan, and a risky action. */
export const SettingsPage = () => (
  <Stack gap="lg">
    <Heading as="h3" variant="h2">
      Settings
    </Heading>
    <Card>
      <CardHeader>
        <CardTitle as="h4">Your profile</CardTitle>
        <CardDescription>This is what other people see.</CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          <Field label="Display name">
            <Input defaultValue="Sam Rivera" />
          </Field>
          <Field label="Language">
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field layout="inline" label="Send me a weekly summary">
            <Checkbox defaultChecked />
          </Field>
        </Stack>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle as="h4">How it looks</CardTitle>
        <CardDescription>Make it comfortable to read.</CardDescription>
      </CardHeader>
      <CardContent>
        <Stack gap="md">
          <Field label="Text size">
            <Slider
              defaultValue={[16]}
              min={12}
              max={24}
              formatValue={(value) => `${value} px`}
              aria-valuetext={(value) => `${value} pixels`}
            />
          </Field>
          <Fieldset legend="Spacing">
            <ToggleGroup
              type="single"
              defaultValue="comfortable"
              aria-label="Spacing"
            >
              <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
              <ToggleGroupItem value="comfortable">Comfortable</ToggleGroupItem>
            </ToggleGroup>
          </Fieldset>
        </Stack>
      </CardContent>
    </Card>
    <Fieldset legend="Your plan">
      <RadioGroup defaultValue="free" className="grid gap-ds-gap-md">
        <RadioCard
          value="free"
          label="Free"
          description="For trying things out."
        />
        <RadioCard
          value="team"
          label="Team"
          description="For small groups who share."
        />
      </RadioGroup>
    </Fieldset>
    <Cluster gap="md">
      <Button>Save changes</Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary">Delete account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Everything you made is removed and this can not be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Cluster>
  </Stack>
);
