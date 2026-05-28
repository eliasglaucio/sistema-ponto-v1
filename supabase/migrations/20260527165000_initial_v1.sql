create extension if not exists pgcrypto;

create table public.admin_profiles (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null unique references auth.users(id) on delete cascade,
	nome text not null,
	role text not null check (role in ('admin', 'rh', 'gestor')),
	ativo boolean not null default true,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now())
);

create table public.colaboradores (
	id uuid primary key default gen_random_uuid(),
	nome text not null,
	funcao text not null,
	setor text not null,
	matricula text unique,
	compreface_subject text not null unique default ('employee:' || gen_random_uuid()::text),
	status_cadastro_facial text not null default 'pendente' check (
		status_cadastro_facial in ('pendente', 'cadastrado', 'falha')
	),
	ativo boolean not null default true,
	created_at timestamptz not null default timezone('utc', now()),
	updated_at timestamptz not null default timezone('utc', now())
);

create table public.face_sessions (
	id uuid primary key default gen_random_uuid(),
	colaborador_id uuid not null references public.colaboradores(id) on delete cascade,
	confidence_score numeric(5, 2) not null,
	recognized_at timestamptz not null default timezone('utc', now()),
	expires_at timestamptz not null,
	consumed_at timestamptz,
	status text not null default 'active' check (
		status in ('active', 'consumed', 'expired', 'revoked')
	),
	created_at timestamptz not null default timezone('utc', now())
);

create table public.registros_ponto (
	id uuid primary key default gen_random_uuid(),
	colaborador_id uuid not null references public.colaboradores(id) on delete restrict,
	evento text not null check (
		evento in (
			'inicio_expediente',
			'ida_intervalo',
			'volta_intervalo',
			'saida_expediente'
		)
	),
	registrado_em timestamptz not null default timezone('utc', now()),
	score_reconhecimento numeric(5, 2),
	origem text not null default 'mobile_web' check (
		origem in ('mobile_web', 'admin_manual')
	),
	face_session_id uuid references public.face_sessions(id) on delete set null,
	observacao text,
	corrigido_por uuid references public.admin_profiles(id) on delete set null,
	created_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
	id uuid primary key default gen_random_uuid(),
	actor_type text not null check (
		actor_type in ('admin', 'colaborador', 'sistema')
	),
	actor_id text,
	action text not null,
	entity_type text not null,
	entity_id text,
	metadata jsonb,
	created_at timestamptz not null default timezone('utc', now())
);

create table public.system_settings (
	key text primary key,
	value jsonb not null,
	description text,
	updated_at timestamptz not null default timezone('utc', now())
);

create index idx_colaboradores_ativo on public.colaboradores(ativo);
create index idx_colaboradores_setor on public.colaboradores(setor);
create index idx_face_sessions_status_expires_at on public.face_sessions(status, expires_at);
create index idx_registros_ponto_colaborador_data on public.registros_ponto(colaborador_id, registrado_em desc);
create index idx_registros_ponto_evento on public.registros_ponto(evento);
create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = timezone('utc', now());
	return new;
end;
$$;

create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create trigger set_colaboradores_updated_at
before update on public.colaboradores
for each row execute function public.set_updated_at();

insert into public.system_settings (key, value, description)
values
	('face_match_threshold', '90', 'Percentual minimo de confianca para reconhecer um colaborador.'),
	('face_session_ttl_seconds', '120', 'Tempo de validade da sessao facial efemera.')
on conflict (key) do nothing;

alter table public.admin_profiles enable row level security;
alter table public.colaboradores enable row level security;
alter table public.face_sessions enable row level security;
alter table public.registros_ponto enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;

grant select on table public.admin_profiles to authenticated;
grant select, insert, update on table public.colaboradores to authenticated;
grant select, insert, update on table public.face_sessions to authenticated;
grant select, insert, update on table public.registros_ponto to authenticated;
grant insert, select on table public.audit_logs to authenticated;
grant select on table public.system_settings to authenticated;

grant select, insert, update, delete on table public.admin_profiles to service_role;
grant select, insert, update, delete on table public.colaboradores to service_role;
grant select, insert, update, delete on table public.face_sessions to service_role;
grant select, insert, update, delete on table public.registros_ponto to service_role;
grant select, insert, update, delete on table public.audit_logs to service_role;
grant select, insert, update, delete on table public.system_settings to service_role;

create policy "admins can read own active profile"
on public.admin_profiles for select to authenticated
using (user_id = (select auth.uid()) and ativo = true);

create policy "active admins can read collaborators"
on public.colaboradores for select to authenticated
using (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid()) and ap.ativo = true
	)
);

create policy "admin and rh can write collaborators"
on public.colaboradores for all to authenticated
using (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid())
			and ap.ativo = true
			and ap.role in ('admin', 'rh')
	)
)
with check (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid())
			and ap.ativo = true
			and ap.role in ('admin', 'rh')
	)
);

create policy "active admins can read face sessions"
on public.face_sessions for select to authenticated
using (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid()) and ap.ativo = true
	)
);

create policy "active admins can read registros"
on public.registros_ponto for select to authenticated
using (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid()) and ap.ativo = true
	)
);

create policy "admin and rh can correct registros"
on public.registros_ponto for all to authenticated
using (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid())
			and ap.ativo = true
			and ap.role in ('admin', 'rh')
	)
)
with check (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid())
			and ap.ativo = true
			and ap.role in ('admin', 'rh')
	)
);

create policy "active admins can read audit"
on public.audit_logs for select to authenticated
using (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid()) and ap.ativo = true
	)
);

create policy "active admins can create audit"
on public.audit_logs for insert to authenticated
with check (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid()) and ap.ativo = true
	)
);

create policy "active admins can read settings"
on public.system_settings for select to authenticated
using (
	exists (
		select 1 from public.admin_profiles ap
		where ap.user_id = (select auth.uid()) and ap.ativo = true
	)
);
