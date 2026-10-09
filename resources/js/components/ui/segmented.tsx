import * as React from "react"

import { cn } from "@/lib/utils"

type Option<T extends string> = {
  value: T
  label: React.ReactNode
}

type SegmentedProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: Option<T>[]
  className?: string
  size?: "sm" | "default"
}

/**
 * A compact pill-style tab switcher.
 */
function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "default",
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      data-slot="segmented"
      className={cn(
        "scrollbar-none inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-white/4 p-1 ring-1 ring-white/6",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "shrink-0 rounded-lg font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
            value === option.value
              ? "bg-white/10 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export { Segmented }
