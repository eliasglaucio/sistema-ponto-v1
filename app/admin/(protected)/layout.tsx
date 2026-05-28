import Link from "next/link"
import type { ReactNode } from "react"

import { logoutAdmin } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { requireAdminSession } from "@/modules/auth/dal"
import { adminRoleLabels } from "@/modules/shared/types"

export const dynamic = "force-dynamic"

export default async function ProtectedAdminLayout({
	children,
}: {
	children: ReactNode
}) {
	const session = await requireAdminSession()

	return (
		<div className="min-h-dvh bg-muted/60">
			<header className="border-b bg-background">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
					<div>
						<Link className="text-lg font-semibold" href="/admin">
							Sistema de Ponto
						</Link>
						<p className="text-sm text-muted-foreground">
							{session.nome} · {adminRoleLabels[session.role]}
						</p>
					</div>
					<nav className="flex flex-wrap items-center gap-2">
						<Link
							className="rounded-md px-3 py-2 text-sm hover:bg-muted"
							href="/admin">
							Dashboard
						</Link>
						<Link
							className="rounded-md px-3 py-2 text-sm hover:bg-muted"
							href="/admin/colaboradores">
							Colaboradores
						</Link>
						<Link
							className="rounded-md px-3 py-2 text-sm hover:bg-muted"
							href="/admin/registros">
							Registros
						</Link>
						<form action={logoutAdmin}>
							<Button size="sm" type="submit" variant="outline">
								Sair
							</Button>
						</form>
					</nav>
				</div>
			</header>
			{children}
		</div>
	)
}
