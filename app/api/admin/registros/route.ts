import { z } from "zod"

import { requireAdminApi } from "@/modules/auth/dal"
import { pontoEventoSchema } from "@/modules/shared/types"
import { listTimeRecords } from "@/modules/timekeeping/repository"

export const dynamic = "force-dynamic"

const querySchema = z.object({
	colaboradorId: z.uuid().optional(),
	evento: pontoEventoSchema.optional(),
	from: z.iso.datetime().optional(),
	setor: z.string().min(1).optional(),
	to: z.iso.datetime().optional(),
})

export async function GET(request: Request) {
	const auth = await requireAdminApi()

	if (auth.error) {
		return auth.error
	}

	const url = new URL(request.url)
	const payload = querySchema.parse({
		colaboradorId: url.searchParams.get("colaboradorId") || undefined,
		evento: url.searchParams.get("evento") || undefined,
		from: url.searchParams.get("from") || undefined,
		setor: url.searchParams.get("setor") || undefined,
		to: url.searchParams.get("to") || undefined,
	})
	const records = await listTimeRecords(payload)

	return Response.json({ records })
}
