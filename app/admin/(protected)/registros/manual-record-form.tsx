"use client"

import { Plus } from "lucide-react"
import { useActionState } from "react"

import {
	createManualRecordAction,
	type CorrectionActionState,
} from "@/app/actions/time-records"
import { Button } from "@/components/ui/button"
import { pontoEventoLabels, pontoEventos } from "@/modules/shared/types"

type ManualRecordFormProps = {
	employees: Array<{ ativo: boolean; id: string; nome: string }>
}

const initialState: CorrectionActionState = {}

export function ManualRecordForm({ employees }: ManualRecordFormProps) {
	const [state, action, pending] = useActionState(
		createManualRecordAction,
		initialState
	)

	return (
		<form action={action} className="grid gap-3">
			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
				<label className="grid gap-1.5 text-sm font-medium">
					Colaborador
					<select
						className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						name="colaboradorId"
						required>
						<option value="">Selecione</option>
						{employees
							.filter((employee) => employee.ativo)
							.map((employee) => (
								<option key={employee.id} value={employee.id}>
									{employee.nome}
								</option>
							))}
					</select>
				</label>
				<label className="grid gap-1.5 text-sm font-medium">
					Evento
					<select
						className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						name="evento"
						required>
						<option value="">Selecione</option>
						{pontoEventos.map((event) => (
							<option key={event} value={event}>
								{pontoEventoLabels[event]}
							</option>
						))}
					</select>
				</label>
				<label className="grid gap-1.5 text-sm font-medium">
					Horario
					<input
						className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						name="registradoEm"
						required
						type="datetime-local"
					/>
				</label>
				<label className="grid gap-1.5 text-sm font-medium">
					Justificativa
					<input
						className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
						name="observacao"
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
					<Plus />
					{pending ? "Criando..." : "Criar ajuste"}
				</Button>
			</div>
		</form>
	)
}
