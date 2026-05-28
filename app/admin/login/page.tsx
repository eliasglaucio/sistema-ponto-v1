import Link from "next/link"

import { LoginForm } from "@/app/admin/login/login-form"

export default function AdminLoginPage() {
	return (
		<main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
			<section className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
				<div className="mb-6">
					<h1 className="mt-1 text-2xl font-semibold">ACESSAR O SISTEMA</h1>
				</div>
				<LoginForm />
				<Link
					className="mt-5 block text-center text-sm leading-none text-muted-foreground hover:text-foreground"
					href="/registrar">
					IR PARA O REGISTRO DE PONTO
				</Link>
			</section>
		</main>
	)
}
