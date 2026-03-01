'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: cycle Tab / Shift+Tab within the modal
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (focusable.length === 0) { e.preventDefault(); return }

        const first = focusable[0]!
        const last = focusable[focusable.length - 1]!

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return

    // Save currently focused element to restore on close
    previousFocusRef.current = document.activeElement as HTMLElement

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    // Move focus into the modal
    const raf = requestAnimationFrame(() => {
      if (!panelRef.current) return
      const first = panelRef.current.querySelector<HTMLElement>(FOCUSABLE)
      if (first) {
        first.focus()
      } else {
        panelRef.current.focus()
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      // Restore focus to the element that triggered the modal
      previousFocusRef.current?.focus()
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full mx-4 bg-surface rounded-xl shadow-xl',
          'border border-border focus:outline-none',
          sizeStyles[size],
          className
        )}
      >
        {/* Header */}
        {(title ?? description) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-bold text-foreground-secondary">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-desc" className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
              aria-label="סגור"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body
  )
}
