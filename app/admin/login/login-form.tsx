"use client"

import { LogIn } from "lucide-react"
import { useActionState } from "react"

import { loginAdmin, type LoginFormState } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { hasPublicSupabaseEnv } from "@/lib/config/env"

const initialState: LoginFormState = {}

export function LoginForm() {
	const [state, action, pending] = useActionState(loginAdmin, initialState)
	const hasEnv = hasPublicSupabaseEnv()

	return (
		<form action={action} className="grid gap-4">
			{!hasEnv ? (
				<p className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-none text-amber-900 uppercase">
					Configure as variaveis publicas do Supabase para habilitar login.
				</p>
			) : null}
			<label className="grid gap-1.5 text-sm font-medium">
				E-MAIL
				<input
					className="h-10 rounded-sm border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
					name="email"
					placeholder="admin@empresa.com"
					type="email"
					required
				/>
			</label>
			<label className="grid gap-1.5 text-sm font-medium">
				SENHA
				<input
					className="h-10 rounded-sm border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
					name="password"
					type="password"
					required
				/>
			</label>
			{state.message ? (
				<p className="text-sm text-destructive">{state.message}</p>
			) : null}
			<Button
				className="h-10 rounded-sm leading-none font-bold hover:bg-chart-3 hover:text-secondary"
				disabled={pending || !hasEnv}
				type="submit">
				<LogIn />
				{pending ? "ENTRANDO..." : "ENTRAR"}
			</Button>
		</form>
	)
}
