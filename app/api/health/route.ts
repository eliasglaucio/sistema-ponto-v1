import { checkCompreFaceHealth } from "@/modules/face/compreface"

export const dynamic = "force-dynamic"

export async function GET() {
	const compreface = await checkCompreFaceHealth().catch(() => false)

	return Response.json({ checks: { compreface }, ok: compreface })
}
