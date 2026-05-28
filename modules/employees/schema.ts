import { z } from "zod"

export const employeeFormSchema = z.object({
	funcao: z.string().trim().min(2, "Informe a funcao."),
	matricula: z
		.string()
		.trim()
		.transform((value) => (value.length ? value : null))
		.nullable(),
	nome: z.string().trim().min(2, "Informe o nome."),
	setor: z.string().trim().min(2, "Informe o setor."),
})

export type EmployeeFormInput = z.infer<typeof employeeFormSchema>
