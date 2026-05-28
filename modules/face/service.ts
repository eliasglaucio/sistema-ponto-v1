import "server-only"

import { getServerEnv } from "@/lib/config/env"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { logAudit } from "@/modules/audit/log"
import {
	getEmployeeBySubject,
	toPublicEmployeeDTO,
} from "@/modules/employees/repository"
import { recognizeFace } from "@/modules/face/compreface"
import { listTodayEvents } from "@/modules/timekeeping/repository"
import { getAllowedEvents } from "@/modules/timekeeping/rules"

const maxImageSize = 5 * 1024 * 1024
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"])

export function assertValidFaceImage(image: File) {
	if (!allowedImageTypes.has(image.type)) {
		throw new Error("Envie uma imagem JPG, PNG ou WebP.")
	}

	if (image.size > maxImageSize) {
		throw new Error("A imagem deve ter no maximo 5 MB.")
	}
}

export async function identifyEmployee(image: File) {
	assertValidFaceImage(image)

	const env = getServerEnv()
	const match = await recognizeFace(image)

	if (!match) {
		await logAudit({
			action: "face.identify.no_match",
			actorType: "sistema",
			entityType: "face_session",
		})
		throw new Error("Rosto nao reconhecido.")
	}

	if (match.confidence < env.FACE_MATCH_THRESHOLD) {
		await logAudit({
			action: "face.identify.low_score",
			actorType: "sistema",
			entityType: "face_session",
			metadata: {
				confidence: match.confidence,
				threshold: env.FACE_MATCH_THRESHOLD,
			},
		})
		throw new Error("Reconhecimento abaixo do limite minimo.")
	}

	const employee = await getEmployeeBySubject(match.subject)

	if (!employee?.ativo) {
		await logAudit({
			action: "face.identify.inactive_or_missing_employee",
			actorType: "sistema",
			entityType: "colaborador",
			metadata: { subject: match.subject },
		})
		throw new Error("Colaborador nao encontrado ou inativo.")
	}

	const supabase = createSupabaseAdminClient()
	const expiresAt = new Date(
		Date.now() + env.FACE_SESSION_TTL_SECONDS * 1000
	).toISOString()
	const { data: faceSession, error } = await supabase
		.from("face_sessions")
		.insert({
			colaborador_id: employee.id,
			confidence_score: match.confidence,
			expires_at: expiresAt,
		})
		.select("id")
		.single()

	if (error) {
		throw new Error(error.message)
	}

	const todayEvents = await listTodayEvents(employee.id)
	const allowedEvents = getAllowedEvents(todayEvents)

	await logAudit({
		action: "face.identify.success",
		actorId: employee.id,
		actorType: "colaborador",
		entityId: faceSession.id,
		entityType: "face_session",
		metadata: { confidence: match.confidence, subject: match.subject },
	})

	return {
		allowedEvents,
		confidence: match.confidence,
		employee: toPublicEmployeeDTO(employee),
		faceSessionId: faceSession.id,
	}
}
