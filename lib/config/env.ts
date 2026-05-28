import { z } from "zod"

const publicEnvSchema = z.object({
	NEXT_PUBLIC_SUPABASE_URL: z.url(),
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

const serverEnvSchema = publicEnvSchema.extend({
	APP_URL: z.url().default("http://localhost:3000"),
	COMPRE_FACE_API_KEY: z.string().min(1),
	COMPRE_FACE_URL: z.url(),
	FACE_MATCH_THRESHOLD: z.coerce.number().min(1).max(100).default(90),
	FACE_SESSION_TTL_SECONDS: z.coerce
		.number()
		.int()
		.min(30)
		.max(300)
		.default(120),
	NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: z.string().optional(),
	SUPABASE_SECRET_KEY: z.string().optional(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
})

export type PublicEnv = z.infer<typeof publicEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema> & {
	SUPABASE_SERVER_SECRET_KEY: string
}

export function getPublicEnv(): PublicEnv {
	return publicEnvSchema.parse({
		NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	})
}

export function hasPublicSupabaseEnv() {
	return publicEnvSchema.safeParse({
		NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	}).success
}

export function getServerEnv(): ServerEnv {
	const parsed = serverEnvSchema.parse({
		APP_URL: process.env.APP_URL,
		COMPRE_FACE_API_KEY: process.env.COMPRE_FACE_API_KEY,
		COMPRE_FACE_URL: process.env.COMPRE_FACE_URL,
		FACE_MATCH_THRESHOLD: process.env.FACE_MATCH_THRESHOLD,
		FACE_SESSION_TTL_SECONDS: process.env.FACE_SESSION_TTL_SECONDS,
		NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_SERVER_ACTIONS_ENCRYPTION_KEY:
			process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY,
		SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
	})
	const secretKey =
		parsed.SUPABASE_SECRET_KEY ?? parsed.SUPABASE_SERVICE_ROLE_KEY

	if (!secretKey) {
		throw new Error(
			"Configure SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY for server-side data access."
		)
	}

	return { ...parsed, SUPABASE_SERVER_SECRET_KEY: secretKey }
}
