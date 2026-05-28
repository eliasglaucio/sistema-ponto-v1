import "server-only"

import { getServerEnv } from "@/lib/config/env"

type CompreFaceSubjectResult = { subject?: string; similarity?: number }

type CompreFaceRecognizeResponse = {
	result?: Array<{ subjects?: CompreFaceSubjectResult[] }>
}

export type FaceMatch = { confidence: number; subject: string }

function buildUrl(path: string) {
	const env = getServerEnv()
	return new URL(path, env.COMPRE_FACE_URL).toString()
}

function getAuthHeaders() {
	const env = getServerEnv()
	return { "x-api-key": env.COMPRE_FACE_API_KEY }
}

export async function recognizeFace(image: File): Promise<FaceMatch | null> {
	const formData = new FormData()
	formData.append("file", image)

	const response = await fetch(buildUrl("/api/v1/recognition/recognize"), {
		body: formData,
		headers: getAuthHeaders(),
		method: "POST",
	})

	if (!response.ok) {
		throw new Error("Falha ao consultar o CompreFace.")
	}

	const payload = (await response.json()) as CompreFaceRecognizeResponse
	const bestSubject = payload.result?.[0]?.subjects?.[0]

	if (!bestSubject?.subject || typeof bestSubject.similarity !== "number") {
		return null
	}

	return { confidence: bestSubject.similarity, subject: bestSubject.subject }
}

export async function enrollFace(subject: string, image: File) {
	const formData = new FormData()
	formData.append("file", image)
	formData.append("subject", subject)

	const response = await fetch(buildUrl("/api/v1/recognition/faces"), {
		body: formData,
		headers: getAuthHeaders(),
		method: "POST",
	})

	if (!response.ok) {
		throw new Error("Falha ao cadastrar face no CompreFace.")
	}
}

export async function checkCompreFaceHealth() {
	const response = await fetch(buildUrl("/api/v1/recognition/faces"), {
		headers: getAuthHeaders(),
		method: "GET",
	})

	return response.ok
}
