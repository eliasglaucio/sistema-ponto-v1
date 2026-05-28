import "server-only"

import { createClient } from "@supabase/supabase-js"

import { getServerEnv } from "@/lib/config/env"
import type { Database } from "@/types/database"

export function createSupabaseAdminClient() {
	const env = getServerEnv()

	return createClient<Database>(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.SUPABASE_SERVER_SECRET_KEY,
		{ auth: { autoRefreshToken: false, persistSession: false } }
	)
}
