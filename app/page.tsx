import { Clock3, ShieldCheck } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function Home() {
	return (
		<main className="flex w-full flex-col bg-background">
			{/* AGRUPAMENTO DAS SEÇÕES */}
			<section className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-6">
				{/* AGRUPAMENTO DAS SEÇÕES - CONTROLE DA LARGURA */}
				<div className="flex w-full flex-col items-center justify-center gap-8 md:max-w-285">
					{/* LOGO - TITÚLO - DESCRIÇÃO */}
					<div className="flex w-full flex-col gap-4">
						{/* LOGO */}
						<div className="flex w-full justify-center md:justify-start">
							<Image
								src={"/GMEDUCACAO.svg"}
								alt="Grupo GM Educação"
								width={260}
								height={232}
								className="h-32 w-fit md:h-42"
							/>
						</div>
						{/* TITÚLO - DESCRIÇÃO */}
						<div className="flex flex-col items-center gap-1 md:items-start">
							<h1 className="font-saira text-3xl font-semibold md:text-6xl">
								SISTEMA DE PONTO
							</h1>
							<p className="max-w-xl text-xs text-muted-foreground md:text-sm">
								SISTEMA DE PONTO COM RECONHECIMENTO FACIAL
							</p>
						</div>
					</div>
					{/* BOTÕES */}
					<div className="flex w-full flex-col items-center gap-4 md:flex-row">
						<Link
							className={cn(
								buttonVariants({ size: "lg" }),
								"w-full max-w-100 rounded-sm px-4 py-2 font-saira text-base leading-none font-semibold md:w-fit"
							)}
							href="/registrar">
							<Clock3 />
							REGISTRAR PONTO
						</Link>
						<Link
							className={cn(
								buttonVariants({ size: "lg", variant: "outline" }),
								"w-full max-w-100 rounded-sm font-saira leading-none font-semibold md:w-fit"
							)}
							href="/admin">
							<ShieldCheck />
							ÁREA ADMINISTRATIVA
						</Link>
					</div>
				</div>
			</section>
		</main>
	)
}
