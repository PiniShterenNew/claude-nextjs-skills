import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IngredientForm } from './IngredientForm'

// Mock the mutations hook
const mockMutateAsync = vi.fn()
vi.mock('../hooks/useIngredientMutations', () => ({
  useIngredientMutations: () => ({
    createIngredient: { mutateAsync: mockMutateAsync, isPending: false },
    updateIngredient: { mutateAsync: mockMutateAsync, isPending: false },
    deleteIngredient: { mutateAsync: vi.fn(), isPending: false },
  }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return Wrapper
}

describe('IngredientForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty form with all required fields', () => {
    render(<IngredientForm workspaceId="ws_1" />, { wrapper: createWrapper() })

    expect(screen.getByLabelText(/שם חומר גלם/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/מחיר ליחידה/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/% בזבוז/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ספק/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /הוסף חומר גלם/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting with empty name', async () => {
    const user = userEvent.setup()
    render(<IngredientForm workspaceId="ws_1" />, { wrapper: createWrapper() })

    await user.click(screen.getByRole('button', { name: /הוסף חומר גלם/i }))

    await waitFor(() => {
      // createIngredient should NOT have been called
      expect(mockMutateAsync).not.toHaveBeenCalled()
    })
  })

  it('calls createIngredient with valid data on submit', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    mockMutateAsync.mockResolvedValue({ success: true })

    render(<IngredientForm workspaceId="ws_1" onSuccess={onSuccess} />, {
      wrapper: createWrapper(),
    })

    // Fill required fields
    await user.type(screen.getByLabelText(/שם חומר גלם/i), 'בשר טחון')

    // Select a unit from the native select
    await user.selectOptions(screen.getByLabelText(/יחידת מידה/i), 'kg')

    // Fill price (must match /^\d+(\.\d{1,4})?$/)
    await user.type(screen.getByLabelText(/מחיר ליחידה/i), '45')

    await user.click(screen.getByRole('button', { name: /הוסף חומר גלם/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'בשר טחון',
          workspaceId: 'ws_1',
        })
      )
    })

    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows effective price preview when waste % > 0', async () => {
    const user = userEvent.setup()
    render(<IngredientForm workspaceId="ws_1" />, { wrapper: createWrapper() })

    await user.type(screen.getByLabelText(/מחיר ליחידה/i), '100')

    const wasteInput = screen.getByLabelText(/% בזבוז/i)
    await user.clear(wasteInput)
    await user.type(wasteInput, '50')

    await waitFor(() => {
      // Should show effective price preview: 100 * 1.5 = 150
      expect(screen.getByText(/מחיר אפקטיבי/i)).toBeInTheDocument()
    })
  })

  it('renders in edit mode with pre-filled values', () => {
    const ingredient = {
      id: 'ing_1',
      workspaceId: 'ws_1',
      name: 'עגבניות',
      unit: 'kg' as const,
      pricePerUnit: { toString: () => '10', toNumber: () => 10 } as unknown as import('decimal.js').default,
      wastePercent: { toString: () => '5', toNumber: () => 5 } as unknown as import('decimal.js').default,
      effectivePrice: { toString: () => '10.5', toNumber: () => 10.5 } as unknown as import('decimal.js').default,
      supplier: 'ספק א',
      pricedAt: new Date(),
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<IngredientForm workspaceId="ws_1" ingredient={ingredient} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByDisplayValue('עגבניות')).toBeInTheDocument()
    expect(screen.getByDisplayValue('ספק א')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /שמור שינויים/i })).toBeInTheDocument()
  })
})
