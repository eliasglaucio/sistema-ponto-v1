import { describe, expect, it } from "vitest"

import { assertValidEvent, getAllowedEvents, getDayState } from "./rules"

describe("timekeeping rules", () => {
	it("allows the first clock-in when the day has no records", () => {
		expect(getDayState([])).toBe("SEM_REGISTRO")
		expect(getAllowedEvents([])).toEqual(["inicio_expediente"])
	})

	it("walks through the v1 sequence in order", () => {
		expect(getAllowedEvents(["inicio_expediente"])).toEqual(["ida_intervalo"])
		expect(getAllowedEvents(["inicio_expediente", "ida_intervalo"])).toEqual([
			"volta_intervalo",
		])
		expect(
			getAllowedEvents([
				"inicio_expediente",
				"ida_intervalo",
				"volta_intervalo",
			])
		).toEqual(["saida_expediente"])
	})

	it("blocks new regular events after checkout", () => {
		expect(
			getAllowedEvents([
				"inicio_expediente",
				"ida_intervalo",
				"volta_intervalo",
				"saida_expediente",
			])
		).toEqual([])
	})

	it("throws when the requested event is outside the current state", () => {
		expect(() => assertValidEvent([], "saida_expediente")).toThrow(
			"Evento invalido"
		)
		expect(() =>
			assertValidEvent(["inicio_expediente", "ida_intervalo"], "saida_expediente")
		).toThrow("Evento invalido")
	})
})
