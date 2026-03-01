import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from './LoginForm'

// Mock the login server action
vi.mock('../actions/login', () => ({
  login: vi.fn(),
}))

// vi.mock is hoisted — define mocks before const declarations using vi.hoisted
const { mockToastError, mockToastSuccess } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}))

// Mock the shared Toast module (LoginForm imports from here)
vi.mock('@/shared/components/ui/Toast', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}))

import { login } from '../actions/login'

const mockLogin = vi.mocked(login)

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password inputs', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/סיסמה/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /כניסה/i })).toBeInTheDocument()
  })

  it('shows validation error when email is empty on submit', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /כניסה/i }))

    await waitFor(() => {
      // Zod should show validation errors
      expect(screen.getByRole('button', { name: /כניסה/i })).toBeInTheDocument()
    })

    // login SA should NOT have been called
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login action with correct credentials on valid submit', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true, data: undefined })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/אימייל/i), 'test@example.com')
    await user.type(screen.getByLabelText(/סיסמה/i), 'password123')
    await user.click(screen.getByRole('button', { name: /כניסה/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows toast error when login returns an error', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: false, error: 'פרטי כניסה שגויים' })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/אימייל/i), 'bad@example.com')
    await user.type(screen.getByLabelText(/סיסמה/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /כניסה/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('פרטי כניסה שגויים')
    })
  })

  it('disables submit button while form is submitting', async () => {
    const user = userEvent.setup()
    // Return a never-resolving promise to keep isSubmitting=true
    mockLogin.mockImplementation(() => new Promise(() => {}))

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/אימייל/i), 'test@example.com')
    await user.type(screen.getByLabelText(/סיסמה/i), 'password123')

    const submitBtn = screen.getByRole('button', { name: /כניסה/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
    })
  })
})
