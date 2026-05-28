import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { logAudit } from "@/modules/audit/log"
import { requireAdminApi } from "@/modules/auth/dal"
import { enrollFace } from "@/modules/face/compreface"
import { assertValidFaceImage } from "@/modules/face/service"

export const dynamic = "force-dynamic"

export async function POST(
	request: Request,
	context: RouteContext<"/api/admin/colaboradores/[id]/face-enroll">
) {
	const auth = await requireAdminApi(["admin", "rh"])

	if (auth.error) {
		return auth.error
	}

	try {
		const { id } = await context.params
		const supabase = createSupabaseAdminClient()
		const { data: employee, error: employeeError } = await supabase
			.from("colaboradores")
			.select("id,compreface_subject")
			.eq("id", id)
			.maybeSingle()

		if (employeeError) {
			throw new Error(employeeError.message)
		}

		if (!employee) {
			return Response.json(
				{ error: "Colaborador nao encontrado." },
				{ status: 404 }
			)
		}

		const formData = await request.formData()
		const images = formData
			.getAll("images")
			.filter((image): image is File => image instanceof File)
			.slice(0, 3)

		if (images.length < 1) {
			return Response.json(
				{ error: "Envie ao menos uma imagem." },
				{ status: 400 }
			)
		}

		for (const image of images) {
			assertValidFaceImage(image)
			await enrollFace(employee.compreface_subject, image)
		}

		const { error: updateError } = await supabase
			.from("colaboradores")
			.update({ status_cadastro_facial: "cadastrado" })
			.eq("id", employee.id)

		if (updateError) {
			throw new Error(updateError.message)
		}

		await logAudit({
			action: "employee.face_enroll.success",
			actorId: auth.session?.profileId,
			actorType: "admin",
			entityId: employee.id,
			entityType: "colaboradores",
			metadata: { images: images.length },
		})

		return Response.json({ success: true })
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Nao foi possivel cadastrar a face.",
			},
			{ status: 400 }
		)
	}
}
