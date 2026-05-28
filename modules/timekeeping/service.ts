import "server-only"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { logAudit } from "@/modules/audit/log"
import type { PontoEvento } from "@/modules/shared/types"
import { listTodayEvents } from "@/modules/timekeeping/repository"
import { assertValidEvent } from "@/modules/timekeeping/rules"

export async function registerTimeEvent(input: {
	evento: PontoEvento
	faceSessionId: string
}) {
	const supabase = createSupabaseAdminClient()
	const { data: faceSession, error: sessionError } = await supabase
		.from("face_sessions")
		.select("id,colaborador_id,confidence_score,expires_at,status")
		.eq("id", input.faceSessionId)
		.maybeSingle()

	if (sessionError) {
		throw new Error(sessionError.message)
	}

	if (!faceSession) {
		throw new Error("Sessao facial nao encontrada.")
	}

	if (faceSession.status !== "active") {
		await logAudit({
			action: "ponto.register.invalid_session_status",
			actorId: faceSession.colaborador_id,
			actorType: "colaborador",
			entityId: faceSession.id,
			entityType: "face_session",
			metadata: { status: faceSession.status },
		})
		throw new Error("Sessao facial ja utilizada ou invalida.")
	}

	if (new Date(faceSession.expires_at).getTime() < Date.now()) {
		await supabase
			.from("face_sessions")
			.update({ status: "expired" })
			.eq("id", faceSession.id)

		await logAudit({
			action: "ponto.register.expired_session",
			actorId: faceSession.colaborador_id,
			actorType: "colaborador",
			entityId: faceSession.id,
			entityType: "face_session",
		})
		throw new Error("Sessao facial expirada. Faca uma nova captura.")
	}

	const todayEvents = await listTodayEvents(faceSession.colaborador_id)
	assertValidEvent(todayEvents, input.evento)

	const { data: registro, error: registerError } = await supabase
		.from("registros_ponto")
		.insert({
			colaborador_id: faceSession.colaborador_id,
			evento: input.evento,
			face_session_id: faceSession.id,
			score_reconhecimento: faceSession.confidence_score,
		})
		.select("id,evento,registrado_em")
		.single()

	if (registerError) {
		throw new Error(registerError.message)
	}

	const { error: consumeError } = await supabase
		.from("face_sessions")
		.update({ consumed_at: new Date().toISOString(), status: "consumed" })
		.eq("id", faceSession.id)

	if (consumeError) {
		throw new Error(consumeError.message)
	}

	await logAudit({
		action: "ponto.register.success",
		actorId: faceSession.colaborador_id,
		actorType: "colaborador",
		entityId: registro.id,
		entityType: "registros_ponto",
		metadata: { evento: input.evento, faceSessionId: faceSession.id },
	})

	return registro
}
