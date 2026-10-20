"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Checkbox,
  Cluster,
  Field,
  Input,
  Label,
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

type Errors = Partial<
  Record<"email" | "country" | "contact" | "terms", string>
>;

export const Demo = () => {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [contact, setContact] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (!email) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Enter an email address like name@example.com.";
    if (!country) next.country = "Choose your country.";
    if (!contact) next.contact = "Choose how we should contact you.";
    if (!terms) next.terms = "Accept the terms to continue.";
    setErrors(next);
    setDone(Object.keys(next).length === 0);
  };

  return (
    <form noValidate onSubmit={onSubmit} className="w-full max-w-sm">
      <Stack gap="md">
        <Field label="Email" required error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Country" required error={errors.country}>
          <Select value={country} onValueChange={setCountry}>
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
        <Field label="Contact me by" required error={errors.contact}>
          <RadioGroup value={contact} onValueChange={setContact}>
            <Cluster gap="xs" align="center">
              <RadioGroupItem value="email" id="contact-email" />
              <Label htmlFor="contact-email">Email</Label>
            </Cluster>
            <Cluster gap="xs" align="center">
              <RadioGroupItem value="phone" id="contact-phone" />
              <Label htmlFor="contact-phone">Phone</Label>
            </Cluster>
          </RadioGroup>
        </Field>
        <Field label="I accept the terms" required error={errors.terms}>
          <Checkbox
            checked={terms}
            onCheckedChange={(checked) => setTerms(checked === true)}
          />
        </Field>
        <Button type="submit">Sign up</Button>
        {done ? (
          <Text role="status">Thanks. Your details look good.</Text>
        ) : null}
      </Stack>
    </form>
  );
};
