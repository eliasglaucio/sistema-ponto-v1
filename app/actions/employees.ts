"use server"

import { revalidatePath } from "next/cache"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { logAudit } from "@/modules/audit/log"
import { requireAdminSession } from "@/modules/auth/dal"
import { employeeFormSchema } from "@/modules/employees/schema"

export type EmployeeActionState = { message?: string; success?: boolean }

export async function createEmployeeAction(
	_state: EmployeeActionState,
	formData: FormData
): Promise<EmployeeActionState> {
	const session = await requireAdminSession(["admin", "rh"])
	const parsed = employeeFormSchema.safeParse({
		funcao: formData.get("funcao"),
		matricula: formData.get("matricula"),
		nome: formData.get("nome"),
		setor: formData.get("setor"),
	})

	if (!parsed.success) {
		return { message: parsed.error.issues[0]?.message ?? "Dados invalidos." }
	}

	const supabase = createSupabaseAdminClient()
	const { data, error } = await supabase
		.from("colaboradores")
		.insert(parsed.data)
		.select("id")
		.single()

	if (error) {
		return { message: error.message }
	}

	await logAudit({
		action: "employee.create",
		actorId: session.profileId,
		actorType: "admin",
		entityId: data.id,
		entityType: "colaboradores",
	})

	revalidatePath("/admin")
	revalidatePath("/admin/colaboradores")

	return { message: "Colaborador cadastrado.", success: true }
}

export async function toggleEmployeeAction(formData: FormData) {
	const session = await requireAdminSession(["admin", "rh"])
	const id = String(formData.get("id") ?? "")
	const ativo = String(formData.get("ativo") ?? "") === "true"
	const supabase = createSupabaseAdminClient()
	const { error } = await supabase
		.from("colaboradores")
		.update({ ativo })
		.eq("id", id)

	if (error) {
		throw new Error(error.message)
	}

	await logAudit({
		action: ativo ? "employee.activate" : "employee.deactivate",
		actorId: session.profileId,
		actorType: "admin",
		entityId: id,
		entityType: "colaboradores",
	})

	revalidatePath("/admin")
	revalidatePath("/admin/colaboradores")
}
