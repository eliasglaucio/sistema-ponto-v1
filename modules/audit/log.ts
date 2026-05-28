import "server-only"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"

type AuditInput = {
	action: string
	actorId?: string | null
	actorType: "admin" | "colaborador" | "sistema"
	entityId?: string | null
	entityType: string
	metadata?: Json
}

export async function logAudit(input: AuditInput) {
	const supabase = createSupabaseAdminClient()

	await supabase
		.from("audit_logs")
		.insert({
			action: input.action,
			actor_id: input.actorId ?? null,
			actor_type: input.actorType,
			entity_id: input.entityId ?? null,
			entity_type: input.entityType,
			metadata: input.metadata ?? null,
		})
}
