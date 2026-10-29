import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "accent" | "outline" | "outline-light";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-btn-bg text-btn-text hover:bg-secondary",
  accent: "bg-accent-btn-bg text-accent-btn-text hover:brightness-105",
  outline: "border-[1.5px] border-heading/70 bg-background/60 text-heading hover:border-accent hover:bg-accent/15",
  "outline-light": "border-[1.5px] border-white/80 bg-transparent text-white hover:border-accent hover:bg-white/10",
};

type Props = {
  variant?: ButtonVariant | "outline";
  arrow?: boolean;
  className?: string;
  children: ReactNode;
} & ({ href: string; newTab?: boolean } & Omit<ComponentProps<"a">, "href" | "className" | "children">
  | ({ href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">));

/** Sized to the approved design: ~49px tall at 1440px wide (3.05rem), pill-shaped, semibold 0.95rem label. */
export function Button(props: Props) {
  const { variant = "primary", arrow = false, className, children } = props;
  const classes = cn(
    "group inline-flex min-h-[3.05rem] items-center justify-center gap-[0.55rem] whitespace-nowrap rounded-full px-[1.7rem] text-[0.95rem] font-semibold",
    "transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transform-none",
    variants[variant], className,
  );
  const content = (
    <>
      {children}
      {arrow && <ArrowRight aria-hidden className="size-[1.05rem] transition-transform duration-200 group-hover:translate-x-1" />}
    </>
  );
  if (props.href !== undefined) {
    const { href, newTab, variant: _v, arrow: _a, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={classes} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {content}
      </Link>
    );
  }
  const { variant: _v, arrow: _a, className: _c, children: _ch, href: _h, ...rest } = props;
  return <button className={classes} {...rest}>{content}</button>;
}
