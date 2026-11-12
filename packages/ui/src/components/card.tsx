import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import type { AsProps, ElementProps } from "@/lib/types";
import { Heading, type HeadingElement, type HeadingProps } from "./heading";
import { Text } from "./text";
import {
  cardContentClasses,
  cardFooterClasses,
  cardHeaderClasses,
  cardMediaClasses,
  cardVariants,
} from "./card.styles";

export type CardElement = "div" | "article" | "section" | "li" | "aside";

export type CardProps = VariantProps<typeof cardVariants> &
  AsProps<"div", Exclude<CardElement, "div">>;

/**
 * Surface for a group of related content. `outline` follows the tone around it;
 * `raised` is a lifted surface that restores the base text, link and action
 * colours, so it reads on any Section tone. Use `as="article"` for a card that
 * stands alone, `as="li"` inside a list.
 */
export const Card = ({ as = "div", variant, className, ...props }: CardProps) =>
  renderAs(as, {
    ...props,
    "data-slot": "card",
    className: cn(cardVariants({ variant }), className),
  });

export type CardMediaProps = ElementProps<"div">;

/** Full-bleed media (image, video). First child sits under the top edge. */
export const CardMedia = ({ className, ...props }: CardMediaProps) => (
  <div
    {...props}
    data-slot="card-media"
    className={cn(cardMediaClasses, className)}
  />
);

export type CardHeaderProps = ElementProps<"div">;

export const CardHeader = ({ className, ...props }: CardHeaderProps) => (
  <div
    {...props}
    data-slot="card-header"
    className={cn(cardHeaderClasses, className)}
  />
);

export type CardTitleProps = Omit<HeadingProps, "as"> & {
  /** Heading level of the card title. Pick it from the page outline; default `h3`. */
  as?: HeadingElement;
};

export const CardTitle = ({
  as = "h3",
  variant = "h3",
  ...props
}: CardTitleProps) => <Heading {...props} as={as} variant={variant} />;

export type CardDescriptionProps = ElementProps<"p">;

export const CardDescription = (props: CardDescriptionProps) => (
  <Text {...props} variant="caption" />
);

export type CardContentProps = ElementProps<"div">;

export const CardContent = ({ className, ...props }: CardContentProps) => (
  <div
    {...props}
    data-slot="card-content"
    className={cn(cardContentClasses, className)}
  />
);

export type CardFooterProps = ElementProps<"div">;

export const CardFooter = ({ className, ...props }: CardFooterProps) => (
  <div
    {...props}
    data-slot="card-footer"
    className={cn(cardFooterClasses, className)}
  />
);
