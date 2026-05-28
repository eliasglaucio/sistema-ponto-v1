import "server-only"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { getPublicEnv } from "@/lib/config/env"
import type { Database } from "@/types/database"

export async function createSupabaseServerClient() {
	const env = getPublicEnv()
	const cookieStore = await cookies()

	return createServerClient<Database>(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, options, value }) => {
							cookieStore.set(name, value, options)
						})
					} catch {
						// Server Components cannot set cookies. Route Handlers and
						// Server Actions still refresh sessions through this client.
					}
				},
			},
		}
	)
}
