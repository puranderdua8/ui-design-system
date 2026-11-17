"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import type { StrictRef } from "@/lib/types";
import { buttonVariants, type ButtonProps } from "./button";
import {
  alertDialogContentClasses,
  alertDialogDescriptionClasses,
  alertDialogFooterClasses,
  alertDialogHeaderClasses,
  alertDialogOverlayClasses,
  alertDialogTitleClasses,
} from "./alert-dialog.styles";
import { ScopedPortal } from "./theme-scope";

export type AlertDialogProps = React.ComponentProps<
  typeof AlertDialogPrimitive.Root
>;

/**
 * A dialog that asks for a decision before something is changed or lost. It
 * cannot be dismissed by a click outside; Escape or Cancel closes it. Focus
 * moves into the dialog (to Cancel) and returns to the trigger on close.
 */
export const AlertDialog = (props: AlertDialogProps) => (
  <AlertDialogPrimitive.Root {...props} />
);

export type AlertDialogTriggerProps = React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Trigger
> & { ref?: StrictRef<HTMLButtonElement> };

/** Opens the dialog. Use `asChild` to put the behaviour on your own `Button`. */
export const AlertDialogTrigger = (props: AlertDialogTriggerProps) => (
  <AlertDialogPrimitive.Trigger {...props} data-slot="alert-dialog-trigger" />
);

export type AlertDialogContentProps = React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Content
> & {
  /**
   * Element the dialog is portalled into. Defaults to `document.body`, where the
   * nearest `ThemeScope`'s theme and direction are re-applied (`ScopedPortal`,
   * D-091); an explicit value wins.
   */
  container?: HTMLElement | null;
  ref?: StrictRef<HTMLDivElement>;
};

/**
 * The scrim and the dialog panel. Give it an `AlertDialogTitle` (its accessible
 * name) and an `AlertDialogDescription`.
 */
export const AlertDialogContent = ({
  className,
  container,
  ...props
}: AlertDialogContentProps) => (
  <ScopedPortal container={container}>
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={alertDialogOverlayClasses}
    />
    <AlertDialogPrimitive.Content
      {...props}
      data-slot="alert-dialog-content"
      className={cn(alertDialogContentClasses, className)}
    />
  </ScopedPortal>
);

export type AlertDialogHeaderProps = React.ComponentPropsWithoutRef<"div"> & {
  ref?: StrictRef<HTMLDivElement>;
};

export const AlertDialogHeader = ({
  className,
  ...props
}: AlertDialogHeaderProps) => (
  <div
    {...props}
    data-slot="alert-dialog-header"
    className={cn(alertDialogHeaderClasses, className)}
  />
);

export type AlertDialogTitleProps = React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Title
> & { ref?: StrictRef<HTMLHeadingElement> };

export const AlertDialogTitle = ({
  className,
  ...props
}: AlertDialogTitleProps) => (
  <AlertDialogPrimitive.Title
    {...props}
    data-slot="alert-dialog-title"
    className={cn(alertDialogTitleClasses, className)}
  />
);

export type AlertDialogDescriptionProps = React.ComponentPropsWithoutRef<
  typeof AlertDialogPrimitive.Description
> & { ref?: StrictRef<HTMLParagraphElement> };

export const AlertDialogDescription = ({
  className,
  ...props
}: AlertDialogDescriptionProps) => (
  <AlertDialogPrimitive.Description
    {...props}
    data-slot="alert-dialog-description"
    className={cn(alertDialogDescriptionClasses, className)}
  />
);

export type AlertDialogFooterProps = React.ComponentPropsWithoutRef<"div"> & {
  ref?: StrictRef<HTMLDivElement>;
};

/** Holds the Cancel and Action buttons. DOM order is visual order (D-064). */
export const AlertDialogFooter = ({
  className,
  ...props
}: AlertDialogFooterProps) => (
  <div
    {...props}
    data-slot="alert-dialog-footer"
    className={cn(alertDialogFooterClasses, className)}
  />
);

type DialogButtonProps = Pick<ButtonProps, "variant" | "size">;

export type AlertDialogActionProps = Omit<
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>,
  "children"
> &
  DialogButtonProps & {
    /** The confirm button's text. Say what happens ("Delete project"), not "OK". */
    children: React.ReactNode;
    ref?: StrictRef<HTMLButtonElement>;
  };

/** Confirms and closes. A primary `Button` by default. */
export const AlertDialogAction = ({
  className,
  variant,
  size,
  ...props
}: AlertDialogActionProps) => (
  <AlertDialogPrimitive.Action
    {...props}
    data-slot="alert-dialog-action"
    className={cn(buttonVariants({ variant, size }), className)}
  />
);

export type AlertDialogCancelProps = Omit<
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>,
  "children"
> &
  DialogButtonProps & {
    /** The cancel button's text. Every string is a prop. */
    children: React.ReactNode;
    ref?: StrictRef<HTMLButtonElement>;
  };

/** Closes without confirming. A secondary `Button` by default; it takes focus first. */
export const AlertDialogCancel = ({
  className,
  variant = "secondary",
  size,
  ...props
}: AlertDialogCancelProps) => (
  <AlertDialogPrimitive.Cancel
    {...props}
    data-slot="alert-dialog-cancel"
    className={cn(buttonVariants({ variant, size }), className)}
  />
);
