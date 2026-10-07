'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Universal Button Design System with WCAG 2.1 AAA Accessibility & Color Differentiation.
 * 
 * Provides clear, distinguishable semantic styles:
 * - primary: Deep Slate/Ocean Navy for main forum actions
 * - success: Emerald Green for Confirm / Save / Solved
 * - warning: Amber Ochre for Cautions / Re-evaluation / Flagging
 * - destructive: Crimson Red for Delete / Critical actions
 * - info: Cobalt Blue for Details / Guides / Calculation Tools
 * - accent: Vivid Teal for TEKNOFEST special features & highlights
 * - secondary: High-contrast neutral with explicit border
 * - outline: Bordered accessible neutral
 * - ghost: Subtle interaction with clear focus outline
 * - link: Underlined focusable text link
 * 
 * Every interactive button enforces:
 * - Minimum 44px touch target on default / lg / icon sizes (WCAG 2.5.5)
 * - Minimum 3:1 focus ring contrast
 * - High contrast active states
 * - Colorblind distinct borders and state indicators
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap rounded-lg select-none cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary Action (New Topic, Main Action)
        primary:
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white shadow-sm border border-transparent focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100",
        default:
          "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white shadow-sm border border-transparent focus-visible:ring-slate-900 dark:focus-visible:ring-slate-100",
        
        // Success Action (Save, Accept, Mark Solved)
        success:
          "bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm border border-emerald-800/40 focus-visible:ring-emerald-600",

        // Warning Action (Caution, Report, Flag)
        warning:
          "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 shadow-sm border border-amber-700/40 focus-visible:ring-amber-500",

        // Destructive / Danger (Delete, Reject)
        destructive:
          "bg-rose-700 text-white hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-sm border border-rose-800/40 focus-visible:ring-rose-600",

        // Info / Guidance (Calculation tools, Legal Docs)
        info:
          "bg-sky-700 text-white hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-500 shadow-sm border border-sky-800/40 focus-visible:ring-sky-500",

        // Accent / Special (TEKNOFEST, Innovations)
        accent:
          "bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 shadow-sm border border-teal-800/40 focus-visible:ring-teal-500",

        // Secondary Neutral
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 focus-visible:ring-slate-500",

        // Outline Neutral
        outline:
          "bg-transparent text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 focus-visible:ring-slate-500",

        // Ghost
        ghost:
          "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 border border-transparent focus-visible:ring-slate-400",

        // Text Link
        link:
          "bg-transparent text-sky-700 dark:text-sky-400 hover:underline p-0 h-auto font-bold border-none focus-visible:ring-sky-500 rounded-none",
      },
      size: {
        default: "min-h-[44px] px-4 py-2 text-sm", // Ensures 44px WCAG minimum touch target
        sm: "min-h-[38px] px-3 py-1.5 text-xs",
        lg: "min-h-[48px] px-6 py-2.5 text-base font-extrabold",
        icon: "min-h-[44px] min-w-[44px] p-0 shrink-0", // 44x44 square for touch
        compact: "min-h-[34px] px-2.5 py-1 text-xs font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
