"use client"

import { ScanFace } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"

type FaceEnrollFormProps = { employeeId: string }

export function FaceEnrollForm({ employeeId }: FaceEnrollFormProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [message, setMessage] = useState<string | null>(null)
	const [pending, setPending] = useState(false)

	async function handleSubmit(formData: FormData) {
		setPending(true)
		setMessage(null)

		try {
			const response = await fetch(
				`/api/admin/colaboradores/${employeeId}/face-enroll`,
				{ body: formData, method: "POST" }
			)
			const payload = (await response.json()) as {
				error?: string
				success?: boolean
			}

			if (!response.ok || !payload.success) {
				throw new Error(payload.error ?? "Falha ao cadastrar face.")
			}

			setMessage("Face cadastrada.")
			inputRef.current?.form?.reset()
		} catch (error) {
			setMessage(
				error instanceof Error ? error.message : "Falha ao cadastrar face."
			)
		} finally {
			setPending(false)
		}
	}

	return (
		<form action={handleSubmit} className="grid gap-2">
			<input
				accept="image/jpeg,image/png,image/webp"
				className="w-full text-xs"
				multiple
				name="images"
				ref={inputRef}
				type="file"
			/>
			<div className="flex items-center justify-between gap-2">
				{message ? (
					<p className="line-clamp-2 text-xs text-muted-foreground">
						{message}
					</p>
				) : (
					<p className="text-xs text-muted-foreground">1 a 3 imagens</p>
				)}
				<Button disabled={pending} size="sm" type="submit" variant="outline">
					<ScanFace />
					{pending ? "Enviando" : "Face"}
				</Button>
			</div>
		</form>
	)
}
