import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:scale-105 hover:shadow-lg hover:from-purple-600 hover:to-pink-600",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-300",
        secondary: "bg-sunshine-200 text-sunshine-900 hover:bg-sunshine-300 shadow-sm",
        ghost: "hover:bg-purple-100 hover:text-purple-800",
        link: "text-purple-600 underline-offset-4 hover:underline",
        fun: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md hover:scale-105 hover:shadow-lg",
        coral: "bg-gradient-to-r from-orange-400 to-coral-400 text-white shadow-md hover:scale-105 hover:shadow-lg",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
