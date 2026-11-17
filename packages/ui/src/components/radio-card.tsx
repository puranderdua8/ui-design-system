"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import {
  radioCardCheckClasses,
  radioCardClasses,
  radioCardDescriptionClasses,
  radioCardLabelClasses,
  radioCardMediaClasses,
} from "./radio-card.styles";

export type RadioCardProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "children"
> & {
  /** The choice's name. It is the control's accessible name. */
  label: React.ReactNode;
  /** One short line under the label. Linked with `aria-describedby`. */
  description?: React.ReactNode;
  /**
   * A picture or preview shown above the label. Decorative by default: it is
   * hidden from assistive technology, so the label must say what the choice is.
   */
  media?: React.ReactNode;
  ref?: StrictRef<HTMLButtonElement>;
};

/**
 * A picture choice: a radio whose whole card is the target. Use it inside a
 * `RadioGroup` (itself in a `Fieldset`). The selected card has a heavier border
 * and a check mark, so the state is not colour alone. Built on the adopted
 * RadioGroup item (no shadcn file exists for it, D-146).
 */
export const RadioCard = ({
  label,
  description,
  media,
  className,
  id,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RadioCardProps) => {
  const reactId = React.useId();
  const base = id ?? reactId;
  const labelId = `${base}-label`;
  const descriptionId = description == null ? undefined : `${base}-description`;
  const describedBy =
    [descriptionId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <RadioGroupPrimitive.Item
      {...props}
      id={base}
      aria-labelledby={ariaLabelledBy ?? labelId}
      aria-describedby={describedBy}
      data-slot="radio-card"
      className={cn(radioCardClasses, className)}
    >
      {media == null ? null : (
        <span
          aria-hidden="true"
          data-slot="radio-card-media"
          className={radioCardMediaClasses}
        >
          {media}
        </span>
      )}
      <span
        id={labelId}
        data-slot="radio-card-label"
        className={radioCardLabelClasses}
      >
        {label}
      </span>
      {description == null ? null : (
        <span
          id={descriptionId}
          data-slot="radio-card-description"
          className={radioCardDescriptionClasses}
        >
          {description}
        </span>
      )}
      <span aria-hidden="true" className={radioCardCheckClasses}>
        <CheckIcon className="size-ds-icon-sm" />
      </span>
    </RadioGroupPrimitive.Item>
  );
};
