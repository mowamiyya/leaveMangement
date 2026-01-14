import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("grid gap-2", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, label, icon, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          "flex items-center space-x-2 cursor-pointer rounded-md border-2 border-input p-3 hover:bg-accent hover:text-accent-foreground transition-colors",
          props.checked && "border-primary bg-accent",
          className
        )}
      >
        <input
          type="radio"
          className="sr-only"
          ref={ref}
          id={id}
          {...props}
        />
        {icon && <span className="text-primary">{icon}</span>}
        {label && <span className="text-sm font-medium">{label}</span>}
      </label>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
