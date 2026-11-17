import {
  Button,
  Checkbox,
  Cluster,
  Field,
  Fieldset,
  Heading,
  Input,
  Label,
  Link,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Text,
} from "@puranderdua/ui";

/** A sign-up form. The preview stops it from submitting (see `Preview`). */
export const SignupPage = () => (
  <form noValidate className="w-full max-w-md">
    <Stack gap="md">
      <Heading as="h3" variant="h2">
        Create your account
      </Heading>
      <Text>
        Already have one? <Link href="#">Sign in</Link>.
      </Text>
      <Field label="Full name" required>
        <Input autoComplete="name" />
      </Field>
      <Field label="Email" description="We only write when it matters.">
        <Input type="email" autoComplete="email" />
      </Field>
      <Field label="Country">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose a country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="in">India</SelectItem>
            <SelectItem value="us">United States</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Fieldset legend="Contact me by">
        <RadioGroup defaultValue="email">
          <Cluster gap="xs" align="center">
            <RadioGroupItem value="email" id="preview-contact-email" />
            <Label htmlFor="preview-contact-email">Email</Label>
          </Cluster>
          <Cluster gap="xs" align="center">
            <RadioGroupItem value="phone" id="preview-contact-phone" />
            <Label htmlFor="preview-contact-phone">Phone</Label>
          </Cluster>
        </RadioGroup>
      </Fieldset>
      <Field layout="inline" label="I accept the terms">
        <Checkbox />
      </Field>
      <Button type="submit">Sign up</Button>
    </Stack>
  </form>
);
