import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
import { RequiredMarker } from "./field-parts";
import { Text } from "./text";

export type LabelProps = ElementProps<"label"> & {
  /** Shows a required marker. The control itself must also carry `required`. */
  required?: boolean;
};

/** A form label: `Text` with the label role, rendered as a `<label>`. */
export const Label = ({
  required = false,
  className,
  children,
  ...props
}: LabelProps) => (
  <Text
    {...props}
    as="label"
    variant="label"
    data-slot="label"
    className={cn("block", className)}
  >
    {children}
    {required ? <RequiredMarker /> : null}
  </Text>
);
