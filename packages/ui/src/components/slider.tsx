"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import { useFieldContext } from "./field";
import {
  sliderClasses,
  sliderRangeClasses,
  sliderThumbClasses,
  sliderTrackClasses,
  sliderValueClasses,
  sliderWrapperClasses,
} from "./slider.styles";

export type SliderProps = Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "aria-valuetext" | "orientation"
> & {
  /**
   * The value in words, for a screen reader ("Medium", "12 pixels"). A function
   * gets each thumb's number and its index.
   */
  "aria-valuetext"?: string | ((value: number, index: number) => string);
  /** Shows the current value as text next to the slider. Default `true`. */
  showValue?: boolean;
  /** Formats the visible value. Default: the number. Two thumbs join with an en dash. */
  formatValue?: (value: number) => string;
  /** Names each thumb of a range slider (`["Minimum", "Maximum"]`). */
  thumbLabels?: readonly string[];
  ref?: StrictRef<HTMLSpanElement>;
};

/**
 * A fine-tune control. Arrow keys move one step, Page Up and Page Down move
 * ten, Home and End jump to the ends. Name it with `aria-label`,
 * `aria-labelledby` or a surrounding `Field`.
 */
export const Slider = ({
  className,
  value: valueProp,
  defaultValue,
  min = 0,
  max = 100,
  onValueChange,
  showValue = true,
  formatValue = String,
  thumbLabels,
  "aria-valuetext": valueText,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SliderProps) => {
  const field = useFieldContext();
  const [inner, setInner] = React.useState<number[]>(defaultValue ?? [min]);
  const values = valueProp ?? inner;
  const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : field?.labelId);
  const describedBy =
    [field?.describedBy, ariaDescribedBy].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div data-slot="slider-wrapper" className={sliderWrapperClasses}>
      <SliderPrimitive.Root
        {...props}
        min={min}
        max={max}
        value={values}
        onValueChange={(next) => {
          setInner(next);
          onValueChange?.(next);
        }}
        data-slot="slider"
        className={cn(sliderClasses, className)}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={sliderTrackClasses}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={sliderRangeClasses}
          />
        </SliderPrimitive.Track>
        {values.map((v, i) => (
          <SliderPrimitive.Thumb
            // Thumbs have no identity of their own: they are the values, by position.
            // eslint-disable-next-line @eslint-react/no-array-index-key
            key={i}
            data-slot="slider-thumb"
            aria-label={thumbLabels?.[i] ?? ariaLabel}
            aria-labelledby={thumbLabels?.[i] ? undefined : labelledBy}
            aria-describedby={describedBy}
            aria-valuetext={
              typeof valueText === "function" ? valueText(v, i) : valueText
            }
            className={sliderThumbClasses}
          />
        ))}
      </SliderPrimitive.Root>
      {showValue ? (
        <output data-slot="slider-value" className={sliderValueClasses}>
          {values.map(formatValue).join(" – ")}
        </output>
      ) : null}
    </div>
  );
};
