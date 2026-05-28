"use server"

import { revalidatePath } from "next/cache"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { logAudit } from "@/modules/audit/log"
import { requireAdminSession } from "@/modules/auth/dal"
import { pontoEventoSchema } from "@/modules/shared/types"

export type CorrectionActionState = { message?: string; success?: boolean }

export async function createManualRecordAction(
	_state: CorrectionActionState,
	formData: FormData
): Promise<CorrectionActionState> {
	const session = await requireAdminSession(["admin", "rh"])
	const colaboradorId = String(formData.get("colaboradorId") ?? "")
	const evento = pontoEventoSchema.safeParse(formData.get("evento"))
	const registradoEm = String(formData.get("registradoEm") ?? "")
	const observacao = String(formData.get("observacao") ?? "").trim()

	if (!colaboradorId || !evento.success || !registradoEm || !observacao) {
		return { message: "Informe colaborador, evento, horario e justificativa." }
	}

	const supabase = createSupabaseAdminClient()
	const { data, error } = await supabase
		.from("registros_ponto")
		.insert({
			colaborador_id: colaboradorId,
			corrigido_por: session.profileId,
			evento: evento.data,
			observacao,
			origem: "admin_manual",
			registrado_em: new Date(registradoEm).toISOString(),
		})
		.select("id")
		.single()

	if (error) {
		return { message: error.message }
	}

	await logAudit({
		action: "ponto.manual_create",
		actorId: session.profileId,
		actorType: "admin",
		entityId: data.id,
		entityType: "registros_ponto",
		metadata: { evento: evento.data, justificativa: observacao },
	})

	revalidatePath("/admin")
	revalidatePath("/admin/registros")

	return { message: "Registro manual criado.", success: true }
}
