import type { PontoEvento } from "@/modules/shared/types"

export type DayState =
	| "SEM_REGISTRO"
	| "EM_EXPEDIENTE"
	| "EM_INTERVALO"
	| "EM_EXPEDIENTE_POS_INTERVALO"
	| "FINALIZADO"

const sequence: PontoEvento[] = [
	"inicio_expediente",
	"ida_intervalo",
	"volta_intervalo",
	"saida_expediente",
]

export function getDayState(events: PontoEvento[]): DayState {
	if (events.length === 0) {
		return "SEM_REGISTRO"
	}

	const last = events.at(-1)

	switch (last) {
		case "inicio_expediente":
			return "EM_EXPEDIENTE"
		case "ida_intervalo":
			return "EM_INTERVALO"
		case "volta_intervalo":
			return "EM_EXPEDIENTE_POS_INTERVALO"
		case "saida_expediente":
			return "FINALIZADO"
		default:
			return "SEM_REGISTRO"
	}
}

export function getAllowedEvents(events: PontoEvento[]): PontoEvento[] {
	const state = getDayState(events)

	switch (state) {
		case "SEM_REGISTRO":
			return ["inicio_expediente"]
		case "EM_EXPEDIENTE":
			return ["ida_intervalo"]
		case "EM_INTERVALO":
			return ["volta_intervalo"]
		case "EM_EXPEDIENTE_POS_INTERVALO":
			return ["saida_expediente"]
		case "FINALIZADO":
			return []
	}
}

export function assertValidEvent(events: PontoEvento[], event: PontoEvento) {
	const allowedEvents = getAllowedEvents(events)

	if (!allowedEvents.includes(event)) {
		const expected = allowedEvents[0]
		const message = expected
			? `Evento invalido. Proximo evento permitido: ${expected}.`
			: "Jornada ja finalizada para hoje."

		throw new Error(message)
	}

	const expectedIndex = events.length
	if (sequence[expectedIndex] !== event) {
		throw new Error("Sequencia de ponto invalida.")
	}
}
