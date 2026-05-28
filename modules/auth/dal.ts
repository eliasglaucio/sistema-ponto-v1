import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { AdminRole } from "@/modules/shared/types"

export type AdminSession = {
	email: string | null
	nome: string
	profileId: string
	role: AdminRole
	userId: string
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
	const supabase = await createSupabaseServerClient()
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser()

	if (userError || !user) {
		return null
	}

	const admin = createSupabaseAdminClient()
	const { data: profile, error: profileError } = await admin
		.from("admin_profiles")
		.select("id,nome,role,user_id,ativo")
		.eq("user_id", user.id)
		.eq("ativo", true)
		.maybeSingle()

	if (profileError || !profile) {
		return null
	}

	return {
		email: user.email ?? null,
		nome: profile.nome,
		profileId: profile.id,
		role: profile.role,
		userId: profile.user_id,
	}
})

export async function requireAdminSession(allowedRoles?: AdminRole[]) {
	const session = await getAdminSession()

	if (!session) {
		redirect("/admin/login")
	}

	if (allowedRoles && !allowedRoles.includes(session.role)) {
		redirect("/admin")
	}

	return session
}

export async function requireAdminApi(allowedRoles?: AdminRole[]) {
	const session = await getAdminSession()

	if (!session) {
		return {
			error: Response.json({ error: "Nao autenticado." }, { status: 401 }),
			session: null,
		}
	}

	if (allowedRoles && !allowedRoles.includes(session.role)) {
		return {
			error: Response.json({ error: "Sem permissao." }, { status: 403 }),
			session,
		}
	}

	return { error: null, session }
}
