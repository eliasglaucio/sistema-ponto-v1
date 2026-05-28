import { identifyEmployee } from "@/modules/face/service"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
	try {
		const formData = await request.formData()
		const image = formData.get("image")

		if (!(image instanceof File)) {
			return Response.json({ error: "Imagem obrigatoria." }, { status: 400 })
		}

		const result = await identifyEmployee(image)

		return Response.json({ success: true, ...result })
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Nao foi possivel identificar o colaborador.",
			},
			{ status: 400 }
		)
	}
}
