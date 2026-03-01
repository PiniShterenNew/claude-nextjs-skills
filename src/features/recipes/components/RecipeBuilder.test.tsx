import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RecipeBuilder } from './RecipeBuilder'

// Mock recipe mutations
const mockCreateRecipe = vi.fn()
const mockUpdateRecipe = vi.fn()
vi.mock('../hooks/useRecipeMutations', () => ({
  useRecipeMutations: () => ({
    createRecipe: { mutateAsync: mockCreateRecipe, isPending: false },
    updateRecipe: { mutateAsync: mockUpdateRecipe, isPending: false },
    deleteRecipe: { mutateAsync: vi.fn(), isPending: false },
  }),
}))

// Mock cost hook
const mockComputeCost = vi.fn()
vi.mock('../hooks/useRecipeCost', () => ({
  useRecipeCost: () => ({
    mutateAsync: mockComputeCost,
    isPending: false,
  }),
}))

// Mock RecipeItemSearch to simplify component tree
vi.mock('./RecipeItemSearch', () => ({
  RecipeItemSearch: ({ onSelect }: { onSelect: (item: { id: string; name: string; type: 'ingredient' | 'subRecipe'; unit: string }) => void }) => (
    <button
      data-testid="add-item-btn"
      onClick={() => onSelect({ id: 'ing_1', name: 'עגבניות', type: 'ingredient', unit: 'kg' })}
    >
      הוסף פריט
    </button>
  ),
}))

// Mock RecipeCostSummary
vi.mock('./RecipeCostSummary', () => ({
  RecipeCostSummary: ({ cost }: { cost: unknown }) => (
    <div data-testid="cost-summary">
      {cost ? 'עלות חושבה' : 'אין עלות'}
    </div>
  ),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
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

const defaultProps = {
  workspaceId: 'ws_1',
  workspaceSlug: 'my-restaurant',
  canViewCosts: true,
}

describe('RecipeBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty builder with recipe form fields', () => {
    render(<RecipeBuilder {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByLabelText(/שם המתכון/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/יחידת תפוקה/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /צור מתכון/i })).toBeInTheDocument()
  })

  it('shows "add item" search and cost summary panel', () => {
    render(<RecipeBuilder {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByTestId('add-item-btn')).toBeInTheDocument()
    expect(screen.getByTestId('cost-summary')).toBeInTheDocument()
  })

  it('adds an ingredient item when selected from search', async () => {
    const user = userEvent.setup()
    render(<RecipeBuilder {...defaultProps} />, { wrapper: createWrapper() })

    await user.click(screen.getByTestId('add-item-btn'))

    // Should render the item row with the ingredient name
    await waitFor(() => {
      expect(screen.getByText('עגבניות')).toBeInTheDocument()
    })
  })

  it('renders in edit mode with "שמור שינויים" button', () => {
    const initialRecipe = {
      id: 'rec_1',
      workspaceId: 'ws_1',
      name: 'פסטה',
      category: null,
      yield: 4,
      yieldUnit: 'מנות',
      isSubRecipe: false,
      sellingPrice: '65',
      vatPercent: 17,
      laborCost: '10',
      overheadCost: null,
      salesVolume: null,
      costStaleSince: null,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<RecipeBuilder {...defaultProps} initialRecipe={initialRecipe} />, {
      wrapper: createWrapper(),
    })

    expect(screen.getByDisplayValue('פסטה')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /שמור שינויים/i })).toBeInTheDocument()
  })

  it('displays cost summary panel (shows "no cost" initially)', () => {
    render(<RecipeBuilder {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByTestId('cost-summary')).toHaveTextContent('אין עלות')
  })
})
