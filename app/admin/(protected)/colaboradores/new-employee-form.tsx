"use client"

import { UserPlus } from "lucide-react"
import { useActionState } from "react"

import {
	createEmployeeAction,
	type EmployeeActionState,
} from "@/app/actions/employees"
import { Button } from "@/components/ui/button"

const initialState: EmployeeActionState = {}

export function NewEmployeeForm() {
	const [state, action, pending] = useActionState(
		createEmployeeAction,
		initialState
	)

	return (
		<form action={action} className="grid gap-3">
			<div className="grid gap-3 md:grid-cols-2">
				<label className="grid gap-1.5 text-sm font-medium">
					Nome
					<input
						className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						name="nome"
						required
					/>
				</label>
				<label className="grid gap-1.5 text-sm font-medium">
					Matricula
					<input
						className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						name="matricula"
					/>
				</label>
				<label className="grid gap-1.5 text-sm font-medium">
					Funcao
					<input
						className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						name="funcao"
						required
					/>
				</label>
				<label className="grid gap-1.5 text-sm font-medium">
					Setor
					<input
						className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						name="setor"
						required
					/>
				</label>
			</div>
			<div className="flex items-center justify-between gap-3">
				{state.message ? (
					<p
						className={
							state.success
								? "text-sm text-emerald-700"
								: "text-sm text-destructive"
						}>
						{state.message}
					</p>
				) : (
					<span />
				)}
				<Button disabled={pending} type="submit">
					<UserPlus />
					{pending ? "Salvando..." : "Cadastrar"}
				</Button>
			</div>
		</form>
	)
}
