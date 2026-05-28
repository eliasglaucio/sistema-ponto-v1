"use server"

import { redirect } from "next/navigation"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type LoginFormState = { message?: string }

export async function loginAdmin(
	_state: LoginFormState,
	formData: FormData
): Promise<LoginFormState> {
	const email = String(formData.get("email") ?? "").trim()
	const password = String(formData.get("password") ?? "")

	if (!email || !password) {
		return { message: "Informe e-mail e senha." }
	}

	const supabase = await createSupabaseServerClient()
	const { error } = await supabase.auth.signInWithPassword({ email, password })

	if (error) {
		return { message: "Credenciais invalidas." }
	}

	redirect("/admin")
}

export async function logoutAdmin() {
	const supabase = await createSupabaseServerClient()
	await supabase.auth.signOut()
	redirect("/admin/login")
}
