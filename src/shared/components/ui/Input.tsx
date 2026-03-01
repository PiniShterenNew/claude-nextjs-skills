import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, startIcon, endIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <span className="absolute inset-y-0 end-3 flex items-center text-muted-foreground pointer-events-none">
              {startIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 rounded-lg border bg-surface text-sm text-foreground',
              'px-3 py-2',
              'placeholder:text-muted-foreground',
              'border-border focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-150',
              startIcon && 'pe-10',
              endIcon && 'ps-10',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />

          {endIcon && (
            <span className="absolute inset-y-0 start-3 flex items-center text-muted-foreground pointer-events-none">
              {endIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
