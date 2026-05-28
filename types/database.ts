export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export type Database = {
	public: {
		Tables: {
			admin_profiles: {
				Row: {
					ativo: boolean
					created_at: string
					id: string
					nome: string
					role: "admin" | "rh" | "gestor"
					updated_at: string
					user_id: string
				}
				Insert: {
					ativo?: boolean
					created_at?: string
					id?: string
					nome: string
					role: "admin" | "rh" | "gestor"
					updated_at?: string
					user_id: string
				}
				Update: {
					ativo?: boolean
					created_at?: string
					id?: string
					nome?: string
					role?: "admin" | "rh" | "gestor"
					updated_at?: string
					user_id?: string
				}
				Relationships: []
			}
			audit_logs: {
				Row: {
					action: string
					actor_id: string | null
					actor_type: "admin" | "colaborador" | "sistema"
					created_at: string
					entity_id: string | null
					entity_type: string
					id: string
					metadata: Json | null
				}
				Insert: {
					action: string
					actor_id?: string | null
					actor_type: "admin" | "colaborador" | "sistema"
					created_at?: string
					entity_id?: string | null
					entity_type: string
					id?: string
					metadata?: Json | null
				}
				Update: {
					action?: string
					actor_id?: string | null
					actor_type?: "admin" | "colaborador" | "sistema"
					created_at?: string
					entity_id?: string | null
					entity_type?: string
					id?: string
					metadata?: Json | null
				}
				Relationships: []
			}
			colaboradores: {
				Row: {
					ativo: boolean
					compreface_subject: string
					created_at: string
					funcao: string
					id: string
					matricula: string | null
					nome: string
					setor: string
					status_cadastro_facial: "pendente" | "cadastrado" | "falha"
					updated_at: string
				}
				Insert: {
					ativo?: boolean
					compreface_subject?: string
					created_at?: string
					funcao: string
					id?: string
					matricula?: string | null
					nome: string
					setor: string
					status_cadastro_facial?: "pendente" | "cadastrado" | "falha"
					updated_at?: string
				}
				Update: {
					ativo?: boolean
					compreface_subject?: string
					created_at?: string
					funcao?: string
					id?: string
					matricula?: string | null
					nome?: string
					setor?: string
					status_cadastro_facial?: "pendente" | "cadastrado" | "falha"
					updated_at?: string
				}
				Relationships: []
			}
			face_sessions: {
				Row: {
					colaborador_id: string
					confidence_score: number
					consumed_at: string | null
					created_at: string
					expires_at: string
					id: string
					recognized_at: string
					status: "active" | "consumed" | "expired" | "revoked"
				}
				Insert: {
					colaborador_id: string
					confidence_score: number
					consumed_at?: string | null
					created_at?: string
					expires_at: string
					id?: string
					recognized_at?: string
					status?: "active" | "consumed" | "expired" | "revoked"
				}
				Update: {
					colaborador_id?: string
					confidence_score?: number
					consumed_at?: string | null
					created_at?: string
					expires_at?: string
					id?: string
					recognized_at?: string
					status?: "active" | "consumed" | "expired" | "revoked"
				}
				Relationships: []
			}
			registros_ponto: {
				Row: {
					colaborador_id: string
					corrigido_por: string | null
					created_at: string
					evento:
						| "inicio_expediente"
						| "ida_intervalo"
						| "volta_intervalo"
						| "saida_expediente"
					face_session_id: string | null
					id: string
					observacao: string | null
					origem: "mobile_web" | "admin_manual"
					registrado_em: string
					score_reconhecimento: number | null
				}
				Insert: {
					colaborador_id: string
					corrigido_por?: string | null
					created_at?: string
					evento:
						| "inicio_expediente"
						| "ida_intervalo"
						| "volta_intervalo"
						| "saida_expediente"
					face_session_id?: string | null
					id?: string
					observacao?: string | null
					origem?: "mobile_web" | "admin_manual"
					registrado_em?: string
					score_reconhecimento?: number | null
				}
				Update: {
					colaborador_id?: string
					corrigido_por?: string | null
					created_at?: string
					evento?:
						| "inicio_expediente"
						| "ida_intervalo"
						| "volta_intervalo"
						| "saida_expediente"
					face_session_id?: string | null
					id?: string
					observacao?: string | null
					origem?: "mobile_web" | "admin_manual"
					registrado_em?: string
					score_reconhecimento?: number | null
				}
				Relationships: []
			}
			system_settings: {
				Row: {
					description: string | null
					key: string
					updated_at: string
					value: Json
				}
				Insert: {
					description?: string | null
					key: string
					updated_at?: string
					value: Json
				}
				Update: {
					description?: string | null
					key?: string
					updated_at?: string
					value?: Json
				}
				Relationships: []
			}
		}
		Views: Record<string, never>
		Functions: Record<string, never>
		Enums: Record<string, never>
		CompositeTypes: Record<string, never>
	}
}
