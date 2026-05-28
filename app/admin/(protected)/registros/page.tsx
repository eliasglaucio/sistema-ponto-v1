import { ManualRecordForm } from "@/app/admin/(protected)/registros/manual-record-form"
import { Button } from "@/components/ui/button"
import { listEmployees } from "@/modules/employees/repository"
import {
	pontoEventoLabels,
	pontoEventoSchema,
	pontoEventos,
} from "@/modules/shared/types"
import { listTimeRecords } from "@/modules/timekeeping/repository"

export const dynamic = "force-dynamic"

type RecordsPageProps = {
	searchParams: Promise<{
		colaboradorId?: string
		evento?: string
		from?: string
		setor?: string
		to?: string
	}>
}

function dateToIso(value?: string, endOfDay = false) {
	if (!value) {
		return undefined
	}

	const date = new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`)
	return date.toISOString()
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
	const params = await searchParams
	const employees = await listEmployees()
	const eventResult = pontoEventoSchema.safeParse(params.evento)
	const records = await listTimeRecords({
		colaboradorId: params.colaboradorId || undefined,
		evento: eventResult.success ? eventResult.data : undefined,
		from: dateToIso(params.from),
		setor: params.setor || undefined,
		to: dateToIso(params.to, true),
	})
	const setores = Array.from(
		new Set(employees.map((employee) => employee.setor))
	)

	return (
		<main className="mx-auto grid max-w-7xl gap-6 px-4 py-6">
			<section>
				<h1 className="text-2xl font-semibold">Registros de ponto</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Consulta operacional, filtros e ajustes manuais auditados.
				</p>
			</section>

			<section className="rounded-lg border bg-card p-4">
				<h2 className="mb-4 font-semibold">Filtros</h2>
				<form className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
					<label className="grid gap-1.5 text-sm font-medium">
						Colaborador
						<select
							className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
							defaultValue={params.colaboradorId ?? ""}
							name="colaboradorId">
							<option value="">Todos</option>
							{employees.map((employee) => (
								<option key={employee.id} value={employee.id}>
									{employee.nome}
								</option>
							))}
						</select>
					</label>
					<label className="grid gap-1.5 text-sm font-medium">
						Setor
						<select
							className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
							defaultValue={params.setor ?? ""}
							name="setor">
							<option value="">Todos</option>
							{setores.map((setor) => (
								<option key={setor} value={setor}>
									{setor}
								</option>
							))}
						</select>
					</label>
					<label className="grid gap-1.5 text-sm font-medium">
						Evento
						<select
							className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
							defaultValue={params.evento ?? ""}
							name="evento">
							<option value="">Todos</option>
							{pontoEventos.map((event) => (
								<option key={event} value={event}>
									{pontoEventoLabels[event]}
								</option>
							))}
						</select>
					</label>
					<label className="grid gap-1.5 text-sm font-medium">
						De
						<input
							className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
							defaultValue={params.from}
							name="from"
							type="date"
						/>
					</label>
					<label className="grid gap-1.5 text-sm font-medium">
						Ate
						<input
							className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
							defaultValue={params.to}
							name="to"
							type="date"
						/>
					</label>
					<div className="flex items-end">
						<Button className="h-10 w-full" type="submit" variant="outline">
							Filtrar
						</Button>
					</div>
				</form>
			</section>

			<section className="rounded-lg border bg-card p-4">
				<h2 className="mb-4 font-semibold">Ajuste manual</h2>
				<ManualRecordForm employees={employees} />
			</section>

			<section className="rounded-lg border bg-card">
				<div className="border-b px-4 py-3">
					<h2 className="font-semibold">Resultado</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full min-w-[760px] text-left text-sm">
						<thead className="bg-muted text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Colaborador</th>
								<th className="px-4 py-3 font-medium">Evento</th>
								<th className="px-4 py-3 font-medium">Data</th>
								<th className="px-4 py-3 font-medium">Origem</th>
								<th className="px-4 py-3 font-medium">Score</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{records.map((record) => {
								const employee = record.colaboradores

								return (
									<tr key={record.id}>
										<td className="px-4 py-3">
											<p className="font-medium">
												{employee?.nome ?? "Sem nome"}
											</p>
											<p className="text-xs text-muted-foreground">
												{employee?.setor ?? "Setor nao informado"}
											</p>
										</td>
										<td className="px-4 py-3">
											{pontoEventoLabels[record.evento]}
										</td>
										<td className="px-4 py-3">
											{new Date(record.registrado_em).toLocaleString("pt-BR")}
										</td>
										<td className="px-4 py-3">{record.origem}</td>
										<td className="px-4 py-3">
											{record.score_reconhecimento?.toFixed(2) ?? "-"}
										</td>
									</tr>
								)
							})}
							{records.length === 0 ? (
								<tr>
									<td
										className="px-4 py-8 text-center text-muted-foreground"
										colSpan={5}>
										Nenhum registro encontrado.
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</section>
		</main>
	)
}
