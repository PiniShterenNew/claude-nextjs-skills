'use client'

import { useState, useRef, useId } from 'react'
import { cn } from '@/shared/lib/cn'

interface TooltipProps {
  content: string
  children: React.ReactElement<{ 'aria-describedby'?: string; onMouseEnter?: () => void; onMouseLeave?: () => void; onFocus?: () => void; onBlur?: () => void }>
  position?: 'top' | 'bottom' | 'start' | 'end'
  className?: string
}

const positionStyles = {
  top: 'bottom-full mb-2 start-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 start-1/2 -translate-x-1/2',
  start: 'end-full me-2 top-1/2 -translate-y-1/2',
  end: 'start-full ms-2 top-1/2 -translate-y-1/2',
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const tooltipId = useId()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    timeoutRef.current = setTimeout(() => setVisible(true), 300)
  }
  function hide() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  const child = children as React.ReactElement<Record<string, unknown>>

  return (
    <span className="relative inline-flex">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(children as React.ReactElement<any>)
        ? (() => {
            const C = child.type as React.ElementType
            return (
              <C
                {...child.props}
                aria-describedby={visible ? tooltipId : undefined}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
              />
            )
          })()
        : children}

      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-2 py-1 text-xs text-white bg-foreground rounded-md whitespace-nowrap',
            'pointer-events-none shadow-md',
            positionStyles[position],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
