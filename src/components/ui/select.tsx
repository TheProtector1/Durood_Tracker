import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps {
  children?: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export interface SelectTriggerProps {
  children?: React.ReactNode
  className?: string
}

export interface SelectValueProps {
  placeholder?: string
}

export interface SelectContentProps {
  children?: React.ReactNode
}

export interface SelectItemProps {
  children?: React.ReactNode
  value: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, value, onValueChange, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        >
          {children}
        </select>
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: SelectValueProps) => {
  return <span>{placeholder}</span>
}

const SelectContent = ({ children }: SelectContentProps) => {
  return (
    <div className="absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      {children}
    </div>
  )
}

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  SelectItemProps
>(({ children, value, ...props }, ref) => {
  return (
    <option ref={ref} value={value} {...props}>
      {children}
    </option>
  )
})
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
