import { cn } from "@/lib/utils";
import type { ElementProps } from "@/lib/types";
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
    {required ? (
      // The marker is decorative: the control's `required` is what assistive
      // technology announces.
      <span aria-hidden="true" className="ms-1 text-ds-danger-fg">
        *
      </span>
    ) : null}
  </Text>
);
