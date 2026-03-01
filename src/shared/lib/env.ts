import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32, {
    message: 'NEXTAUTH_SECRET must be at least 32 characters',
  }),
  NEXTAUTH_URL: z.string().url({ message: 'NEXTAUTH_URL must be a valid URL' }),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_', {
    message: 'RESEND_API_KEY must start with re_',
  }),
  RESEND_FROM_EMAIL: z.string().email({
    message: 'RESEND_FROM_EMAIL must be a valid email address',
  }),

  // Node
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

type Env = z.infer<typeof envSchema>

function createEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const messages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${(msgs ?? []).join(', ')}`)
      .join('\n')

    throw new Error(
      `\n❌ Invalid environment variables:\n${messages}\n\nPlease check your .env file.`
    )
  }

  return parsed.data
}

export const env = createEnv()
