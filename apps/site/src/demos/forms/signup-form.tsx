"use client";

import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import {
  Button,
  Checkbox,
  Cluster,
  Field,
  Fieldset,
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

type Name = "email" | "country" | "contact" | "terms";
type Errors = Partial<Record<Name, string>>;

export const Demo = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [contact, setContact] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  /** A field's error goes away as soon as the field changes. */
  const clear = (name: Name) =>
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {};
    if (!email) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Enter an email address like name@example.com.";
    if (!country) next.country = "Choose your country.";
    if (!contact) next.contact = "Choose how we should contact you.";
    if (!terms) next.terms = "Accept the terms to continue.";

    // Render the invalid state first, so the control we focus is already marked invalid.
    flushSync(() => {
      setErrors(next);
      setDone(Object.keys(next).length === 0);
    });

    // First invalid control in DOM order. A radio group is not focusable itself: focus its first radio.
    const invalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    const target =
      invalid?.getAttribute("role") === "radiogroup"
        ? invalid.querySelector<HTMLElement>('[role="radio"]')
        : invalid;
    target?.focus();
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      className="w-full max-w-sm"
    >
      <Stack gap="md">
        <Field label="Email" required error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear("email");
            }}
          />
        </Field>
        <Field label="Country" required error={errors.country}>
          <Select
            value={country}
            onValueChange={(value) => {
              setCountry(value);
              clear("country");
            }}
          >
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
        <Fieldset legend="Contact me by" required error={errors.contact}>
          <RadioGroup
            value={contact}
            onValueChange={(value) => {
              setContact(value);
              clear("contact");
            }}
          >
            <Cluster gap="xs" align="center">
              <RadioGroupItem value="email" id="contact-email" />
              <Label htmlFor="contact-email">Email</Label>
            </Cluster>
            <Cluster gap="xs" align="center">
              <RadioGroupItem value="phone" id="contact-phone" />
              <Label htmlFor="contact-phone">Phone</Label>
            </Cluster>
          </RadioGroup>
        </Fieldset>
        <Field
          layout="inline"
          label="I accept the terms"
          required
          error={errors.terms}
        >
          <Checkbox
            checked={terms}
            onCheckedChange={(checked) => {
              setTerms(checked === true);
              clear("terms");
            }}
          />
        </Field>
        <Button type="submit">Sign up</Button>
        {/* Always in the DOM, so a screen reader is already watching it when the text arrives. */}
        <Text role="status">
          {done ? "Thanks. Your details look good." : ""}
        </Text>
      </Stack>
    </form>
  );
};
