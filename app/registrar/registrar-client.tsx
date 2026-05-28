"use client"

import {
	Camera,
	CheckCircle2,
	Clock,
	RefreshCcw,
	ScanFace,
	ShieldAlert,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import type { PontoEvento, PublicEmployeeDTO } from "@/modules/shared/types"
import { pontoEventoLabels } from "@/modules/shared/types"

type IdentifyResponse = {
	allowedEvents: PontoEvento[]
	confidence: number
	employee: PublicEmployeeDTO
	error?: string
	faceSessionId: string
	success: boolean
}

type RegisterResponse = {
	error?: string
	registro?: { evento: PontoEvento; id: string; registradoEm: string }
	success: boolean
}

export function RegistrarClient() {
	const videoRef = useRef<HTMLVideoElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const [cameraReady, setCameraReady] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [pending, setPending] = useState(false)
	const [identity, setIdentity] = useState<IdentifyResponse | null>(null)
	const [success, setSuccess] = useState<RegisterResponse["registro"] | null>(
		null
	)

	async function startCamera() {
		setError(null)

		if (!navigator.mediaDevices?.getUserMedia) {
			setError("Este navegador nao oferece acesso a camera.")
			return
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: false,
				video: {
					facingMode: "user",
					height: { ideal: 1280 },
					width: { ideal: 720 },
				},
			})

			streamRef.current = stream

			if (videoRef.current) {
				videoRef.current.srcObject = stream
				await videoRef.current.play()
				setCameraReady(true)
			}
		} catch {
			setError("Permita o uso da camera para registrar o ponto.")
		}
	}

	function stopCamera() {
		streamRef.current?.getTracks().forEach((track) => track.stop())
		streamRef.current = null
		setCameraReady(false)
	}

	useEffect(() => {
		return () => {
			streamRef.current?.getTracks().forEach((track) => track.stop())
			streamRef.current = null
		}
	}, [])

	async function captureBlob() {
		const video = videoRef.current
		const canvas = canvasRef.current

		if (!video || !canvas) {
			throw new Error("Camera indisponivel.")
		}

		canvas.width = video.videoWidth
		canvas.height = video.videoHeight
		const context = canvas.getContext("2d")

		if (!context) {
			throw new Error("Nao foi possivel capturar a imagem.")
		}

		context.drawImage(video, 0, 0, canvas.width, canvas.height)

		return new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error("Nao foi possivel gerar a imagem."))
						return
					}

					resolve(blob)
				},
				"image/jpeg",
				0.9
			)
		})
	}

	async function identify() {
		setPending(true)
		setError(null)
		setIdentity(null)
		setSuccess(null)

		try {
			const blob = await captureBlob()
			const formData = new FormData()
			formData.append("image", blob, "selfie.jpg")

			const response = await fetch("/api/face/identify", {
				body: formData,
				method: "POST",
			})
			const payload = (await response.json()) as IdentifyResponse

			if (!response.ok || !payload.success) {
				throw new Error(payload.error ?? "Rosto nao reconhecido.")
			}

			setIdentity(payload)
			stopCamera()
		} catch (captureError) {
			setError(
				captureError instanceof Error
					? captureError.message
					: "Nao foi possivel identificar."
			)
		} finally {
			setPending(false)
		}
	}

	async function register(evento: PontoEvento) {
		if (!identity) {
			return
		}

		setPending(true)
		setError(null)

		try {
			const response = await fetch("/api/ponto/register", {
				body: JSON.stringify({ evento, faceSessionId: identity.faceSessionId }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			})
			const payload = (await response.json()) as RegisterResponse

			if (!response.ok || !payload.success || !payload.registro) {
				throw new Error(payload.error ?? "Nao foi possivel registrar.")
			}

			setSuccess(payload.registro)
			setIdentity(null)
		} catch (registerError) {
			setError(
				registerError instanceof Error
					? registerError.message
					: "Nao foi possivel registrar."
			)
		} finally {
			setPending(false)
		}
	}

	function reset() {
		setIdentity(null)
		setSuccess(null)
		setError(null)
		void startCamera()
	}

	return (
		<section className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
			<header className="border-b px-5 py-4">
				<p className="text-sm font-medium text-muted-foreground">
					Sistema de Ponto
				</p>
				<h1 className="text-2xl font-semibold">Registrar ponto</h1>
			</header>

			<div className="grid flex-1 content-start gap-5 px-5 py-5">
				<div className="overflow-hidden rounded-lg border bg-card">
					<div className="relative aspect-[3/4] bg-zinc-950">
						<video
							className="h-full w-full object-cover"
							muted
							playsInline
							ref={videoRef}
						/>
						{!cameraReady && !identity && !success ? (
							<div className="absolute inset-0 grid place-items-center text-center text-zinc-200">
								<div>
									<ScanFace className="mx-auto mb-3 size-10" />
									<p className="text-sm">Camera frontal</p>
								</div>
							</div>
						) : null}
					</div>
				</div>

				<canvas className="hidden" ref={canvasRef} />

				{error ? (
					<div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
						<ShieldAlert className="mt-0.5 size-4 shrink-0" />
						<p>{error}</p>
					</div>
				) : null}

				{success ? (
					<div className="rounded-lg border bg-card p-4 text-center">
						<CheckCircle2 className="mx-auto mb-3 size-10 text-emerald-600" />
						<h2 className="font-semibold">Ponto registrado</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							{pontoEventoLabels[success.evento]} ·{" "}
							{new Date(success.registradoEm).toLocaleString("pt-BR")}
						</p>
						<Button className="mt-4 w-full" onClick={reset} type="button">
							<RefreshCcw />
							Novo registro
						</Button>
					</div>
				) : null}

				{identity ? (
					<div className="rounded-lg border bg-card p-4">
						<p className="text-sm text-muted-foreground">Identidade validada</p>
						<h2 className="mt-1 text-xl font-semibold">
							{identity.employee.nome}
						</h2>
						<p className="text-sm text-muted-foreground">
							{identity.employee.funcao} · {identity.employee.setor}
						</p>
						<p className="mt-2 text-xs text-muted-foreground">
							Confianca: {identity.confidence.toFixed(2)}%
						</p>
						<div className="mt-4 grid gap-2">
							{identity.allowedEvents.map((event) => (
								<Button
									className="h-11"
									disabled={pending}
									key={event}
									onClick={() => register(event)}
									type="button">
									<Clock />
									{pontoEventoLabels[event]}
								</Button>
							))}
							{identity.allowedEvents.length === 0 ? (
								<p className="rounded-md bg-muted p-3 text-center text-sm text-muted-foreground">
									Jornada finalizada para hoje.
								</p>
							) : null}
							<Button onClick={reset} type="button" variant="outline">
								Capturar novamente
							</Button>
						</div>
					</div>
				) : null}

				{!identity && !success ? (
					<div className="grid gap-2">
						{cameraReady ? (
							<Button
								className="h-12"
								disabled={pending}
								onClick={identify}
								type="button">
								<ScanFace />
								{pending ? "Identificando..." : "Capturar e identificar"}
							</Button>
						) : (
							<Button className="h-12" onClick={startCamera} type="button">
								<Camera />
								Abrir camera
							</Button>
						)}
					</div>
				) : null}
			</div>
		</section>
	)
}
