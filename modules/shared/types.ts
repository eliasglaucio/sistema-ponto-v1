import { z } from "zod"

export const adminRoles = ["admin", "rh", "gestor"] as const
export const colaboradorStatuses = ["pendente", "cadastrado", "falha"] as const
export const faceSessionStatuses = [
	"active",
	"consumed",
	"expired",
	"revoked",
] as const
export const pontoEventos = [
	"inicio_expediente",
	"ida_intervalo",
	"volta_intervalo",
	"saida_expediente",
] as const

export const pontoEventoSchema = z.enum(pontoEventos)
export const adminRoleSchema = z.enum(adminRoles)
export const colaboradorStatusSchema = z.enum(colaboradorStatuses)
export const faceSessionStatusSchema = z.enum(faceSessionStatuses)

export type AdminRole = (typeof adminRoles)[number]
export type ColaboradorStatus = (typeof colaboradorStatuses)[number]
export type FaceSessionStatus = (typeof faceSessionStatuses)[number]
export type PontoEvento = (typeof pontoEventos)[number]

export type PublicEmployeeDTO = {
	id: string
	nome: string
	funcao: string
	setor: string
}

export const pontoEventoLabels: Record<PontoEvento, string> = {
	inicio_expediente: "Inicio de expediente",
	ida_intervalo: "Ida ao intervalo",
	volta_intervalo: "Volta do intervalo",
	saida_expediente: "Saida do expediente",
}

export const adminRoleLabels: Record<AdminRole, string> = {
	admin: "Administrador",
	rh: "RH",
	gestor: "Gestor",
}
