import { Clock, UserRoundCheck, UsersRound } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { listEmployees } from "@/modules/employees/repository"
import { pontoEventoLabels } from "@/modules/shared/types"
import { listRecentTimeRecords } from "@/modules/timekeeping/repository"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
	const [employees, records] = await Promise.all([
		listEmployees(),
		listRecentTimeRecords(8),
	])
	const activeEmployees = employees.filter((employee) => employee.ativo).length
	const enrolledEmployees = employees.filter(
		(employee) => employee.status_cadastro_facial === "cadastrado"
	).length

	return (
		<main className="mx-auto grid max-w-7xl gap-6 px-4 py-6">
			<section className="grid gap-4 md:grid-cols-3">
				<div className="rounded-lg border bg-card p-4">
					<UsersRound className="mb-3 size-5 text-primary" />
					<p className="text-2xl font-semibold">{activeEmployees}</p>
					<p className="text-sm text-muted-foreground">Colaboradores ativos</p>
				</div>
				<div className="rounded-lg border bg-card p-4">
					<UserRoundCheck className="mb-3 size-5 text-primary" />
					<p className="text-2xl font-semibold">{enrolledEmployees}</p>
					<p className="text-sm text-muted-foreground">Faces cadastradas</p>
				</div>
				<div className="rounded-lg border bg-card p-4">
					<Clock className="mb-3 size-5 text-primary" />
					<p className="text-2xl font-semibold">{records.length}</p>
					<p className="text-sm text-muted-foreground">Ultimos registros</p>
				</div>
			</section>

			<section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
				<div className="rounded-lg border bg-card">
					<div className="flex items-center justify-between border-b px-4 py-3">
						<h2 className="font-semibold">Registros recentes</h2>
						<Link
							className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
							href="/admin/registros">
							Ver todos
						</Link>
					</div>
					<div className="divide-y">
						{records.map((record) => {
							const employee = record.colaboradores

							return (
								<div
									className="grid gap-1 px-4 py-3 text-sm md:grid-cols-[1fr_auto]"
									key={record.id}>
									<div>
										<p className="font-medium">
											{employee?.nome ?? "Sem nome"}
										</p>
										<p className="text-muted-foreground">
											{employee?.setor ?? "Setor nao informado"} ·{" "}
											{pontoEventoLabels[record.evento]}
										</p>
									</div>
									<time className="text-muted-foreground">
										{new Date(record.registrado_em).toLocaleString("pt-BR")}
									</time>
								</div>
							)
						})}
						{records.length === 0 ? (
							<p className="px-4 py-6 text-sm text-muted-foreground">
								Nenhum registro encontrado.
							</p>
						) : null}
					</div>
				</div>

				<div className="rounded-lg border bg-card p-4">
					<h2 className="font-semibold">Atalhos</h2>
					<div className="mt-4 grid gap-2">
						<Link
							className={cn(buttonVariants({ variant: "outline" }))}
							href="/admin/colaboradores">
							Gerenciar colaboradores
						</Link>
						<Link
							className={cn(buttonVariants({ variant: "outline" }))}
							href="/registrar">
							Abrir registro publico
						</Link>
					</div>
				</div>
			</section>
		</main>
	)
}
