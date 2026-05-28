import { z } from "zod"

import { pontoEventoSchema } from "@/modules/shared/types"
import { registerTimeEvent } from "@/modules/timekeeping/service"

export const dynamic = "force-dynamic"

const registerPointSchema = z.object({
	evento: pontoEventoSchema,
	faceSessionId: z.uuid(),
})

export async function POST(request: Request) {
	try {
		const payload = registerPointSchema.parse(await request.json())
		const registro = await registerTimeEvent(payload)

		return Response.json({
			registro: {
				evento: registro.evento,
				id: registro.id,
				registradoEm: registro.registrado_em,
			},
			success: true,
		})
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Nao foi possivel registrar o ponto.",
			},
			{ status: 400 }
		)
	}
}
