import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })
config({ path: '.env.local', override: false })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL 未設定，請確認 .env 或 .env.local')
  process.exit(1)
}

export default defineConfig({
  schema: './src/infrastructure/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
