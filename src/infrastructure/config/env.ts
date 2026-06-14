import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  CWA_API_KEY: z.string().min(1),
  CWA_STATION_ID_SHINDIAN: z.string().min(1),
  CWA_STATION_ID_NEIHU: z.string().min(1),
  NEXT_PUBLIC_LIFF_ID: z.string().optional(),
})

export const env = envSchema.parse(process.env)
