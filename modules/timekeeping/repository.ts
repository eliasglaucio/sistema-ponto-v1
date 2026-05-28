import "server-only"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import type { PontoEvento } from "@/modules/shared/types"

export type TimeRecordWithEmployee = {
	colaborador_id: string
	colaboradores: {
		funcao: string
		id: string
		nome: string
		setor: string
	} | null
	evento: PontoEvento
	id: string
	observacao?: string | null
	origem: "mobile_web" | "admin_manual"
	registrado_em: string
	score_reconhecimento: number | null
}

function getLocalDayBounds(date = new Date()) {
	const start = new Date(date)
	start.setHours(0, 0, 0, 0)

	const end = new Date(start)
	end.setDate(end.getDate() + 1)

	return { end: end.toISOString(), start: start.toISOString() }
}

export async function listTodayEvents(colaboradorId: string) {
	const supabase = createSupabaseAdminClient()
	const { end, start } = getLocalDayBounds()
	const { data, error } = await supabase
		.from("registros_ponto")
		.select("evento")
		.eq("colaborador_id", colaboradorId)
		.gte("registrado_em", start)
		.lt("registrado_em", end)
		.order("registrado_em", { ascending: true })

	if (error) {
		throw new Error(error.message)
	}

	return (data ?? []).map((row) => row.evento as PontoEvento)
}

export async function listRecentTimeRecords(limit = 20) {
	const supabase = createSupabaseAdminClient()
	const { data, error } = await supabase
		.from("registros_ponto")
		.select("id,colaborador_id,evento,registrado_em,origem,score_reconhecimento")
		.order("registrado_em", { ascending: false })
		.limit(limit)

	if (error) {
		throw new Error(error.message)
	}

	return hydrateEmployees(data ?? [])
}

export async function listTimeRecords(filters: {
	colaboradorId?: string
	evento?: PontoEvento
	from?: string
	setor?: string
	to?: string
}) {
	const supabase = createSupabaseAdminClient()
	let query = supabase
		.from("registros_ponto")
		.select(
			"id,colaborador_id,evento,registrado_em,origem,score_reconhecimento,observacao"
		)
		.order("registrado_em", { ascending: false })
		.limit(100)

	if (filters.colaboradorId) {
		query = query.eq("colaborador_id", filters.colaboradorId)
	}

	if (filters.evento) {
		query = query.eq("evento", filters.evento)
	}

	if (filters.from) {
		query = query.gte("registrado_em", filters.from)
	}

	if (filters.to) {
		query = query.lte("registrado_em", filters.to)
	}

	const { data, error } = await query

	if (error) {
		throw new Error(error.message)
	}

	const records = await hydrateEmployees(data ?? [])

	if (!filters.setor) {
		return records
	}

	return records.filter((record) => {
		return record.colaboradores?.setor === filters.setor
	})
}

async function hydrateEmployees(
	records: Array<{
		colaborador_id: string
		evento: PontoEvento
		id: string
		observacao?: string | null
		origem: "mobile_web" | "admin_manual"
		registrado_em: string
		score_reconhecimento: number | null
	}>
): Promise<TimeRecordWithEmployee[]> {
	if (records.length === 0) {
		return []
	}

	const supabase = createSupabaseAdminClient()
	const employeeIds = Array.from(
		new Set(records.map((record) => record.colaborador_id))
	)
	const { data: employees, error } = await supabase
		.from("colaboradores")
		.select("id,nome,setor,funcao")
		.in("id", employeeIds)

	if (error) {
		throw new Error(error.message)
	}

	const employeesById = new Map(
		(employees ?? []).map((employee) => [employee.id, employee])
	)

	return records.map((record) => ({
		...record,
		colaboradores: employeesById.get(record.colaborador_id) ?? null,
	}))
}
