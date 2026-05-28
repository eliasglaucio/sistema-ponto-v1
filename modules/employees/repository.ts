import "server-only"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import type { PublicEmployeeDTO } from "@/modules/shared/types"

export async function listEmployees() {
	const supabase = createSupabaseAdminClient()
	const { data, error } = await supabase
		.from("colaboradores")
		.select(
			"id,nome,funcao,setor,matricula,ativo,status_cadastro_facial,compreface_subject,created_at"
		)
		.order("nome")

	if (error) {
		throw new Error(error.message)
	}

	return data ?? []
}

export async function getEmployeeById(id: string) {
	const supabase = createSupabaseAdminClient()
	const { data, error } = await supabase
		.from("colaboradores")
		.select("*")
		.eq("id", id)
		.maybeSingle()

	if (error) {
		throw new Error(error.message)
	}

	return data
}

export async function getEmployeeBySubject(subject: string) {
	const supabase = createSupabaseAdminClient()
	const { data, error } = await supabase
		.from("colaboradores")
		.select("id,nome,funcao,setor,ativo,status_cadastro_facial")
		.eq("compreface_subject", subject)
		.eq("ativo", true)
		.maybeSingle()

	if (error) {
		throw new Error(error.message)
	}

	return data
}

export function toPublicEmployeeDTO(employee: {
	funcao: string
	id: string
	nome: string
	setor: string
}): PublicEmployeeDTO {
	return {
		funcao: employee.funcao,
		id: employee.id,
		nome: employee.nome,
		setor: employee.setor,
	}
}
