import { toggleEmployeeAction } from "@/app/actions/employees"
import { FaceEnrollForm } from "@/app/admin/(protected)/colaboradores/face-enroll-form"
import { NewEmployeeForm } from "@/app/admin/(protected)/colaboradores/new-employee-form"
import { Button } from "@/components/ui/button"
import { listEmployees } from "@/modules/employees/repository"

export const dynamic = "force-dynamic"

export default async function EmployeesPage() {
	const employees = await listEmployees()

	return (
		<main className="flex w-full flex-col items-center gap-4 px-4 py-6 md:max-w-285">
			<section className="flex w-full flex-col gap-1">
				<h1 className="font-saira text-2xl font-semibold">COLABORADORES</h1>
				<p className="text-sm leading-none text-muted-foreground">
					Cadastro operacional e vinculo facial usado no registro de ponto.
				</p>
			</section>

			<section className="w-full rounded-lg border bg-card p-4">
				<h2 className="mb-4 font-semibold">Novo colaborador</h2>
				<NewEmployeeForm />
			</section>

			<section className="rounded-lg border bg-card">
				<div className="border-b px-4 py-3">
					<h2 className="font-semibold">Lista</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Nome</th>
								<th className="px-4 py-3 font-medium">Setor</th>
								<th className="px-4 py-3 font-medium">Funcao</th>
								<th className="px-4 py-3 font-medium">Face</th>
								<th className="px-4 py-3 font-medium">Status</th>
								<th className="px-4 py-3 font-medium">Acoes</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{employees.map((employee) => (
								<tr key={employee.id}>
									<td className="px-4 py-3">
										<p className="font-medium">{employee.nome}</p>
										<p className="text-xs text-muted-foreground">
											{employee.matricula ?? "Sem matricula"}
										</p>
									</td>
									<td className="px-4 py-3">{employee.setor}</td>
									<td className="px-4 py-3">{employee.funcao}</td>
									<td className="px-4 py-3">
										<span className="rounded-md bg-muted px-2 py-1 text-xs">
											{employee.status_cadastro_facial}
										</span>
									</td>
									<td className="px-4 py-3">
										<span
											className={
												employee.ativo
													? "text-emerald-700"
													: "text-muted-foreground"
											}>
											{employee.ativo ? "Ativo" : "Inativo"}
										</span>
									</td>
									<td className="grid gap-3 px-4 py-3">
										<FaceEnrollForm employeeId={employee.id} />
										<form action={toggleEmployeeAction}>
											<input name="id" type="hidden" value={employee.id} />
											<input
												name="ativo"
												type="hidden"
												value={employee.ativo ? "false" : "true"}
											/>
											<Button size="sm" type="submit" variant="outline">
												{employee.ativo ? "Desativar" : "Ativar"}
											</Button>
										</form>
									</td>
								</tr>
							))}
							{employees.length === 0 ? (
								<tr>
									<td
										className="px-4 py-8 text-center text-muted-foreground"
										colSpan={6}>
										Nenhum colaborador cadastrado.
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
