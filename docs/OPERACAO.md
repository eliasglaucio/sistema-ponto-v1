# Operacao da v1

## Setup local

1. Copie `.env.example` para `.env.local` e preencha Supabase e CompreFace.
2. Aplique `supabase/migrations/20260527165000_initial_v1.sql` no SQL Editor do Supabase ou no banco local.
3. Crie o usuario admin no Supabase Auth.
4. Insira um perfil em `admin_profiles` apontando para `auth.users.id`.
5. Rode `npm run dev`.

## Variaveis importantes

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publishable para cliente SSR/browser.
- `SUPABASE_SECRET_KEY`: chave secreta server-side. Nunca expor como `NEXT_PUBLIC_`.
- `COMPRE_FACE_URL`: URL interna ou local do CompreFace.
- `COMPRE_FACE_API_KEY`: API key do servico de recognition do CompreFace.
- `FACE_MATCH_THRESHOLD`: score minimo de reconhecimento.
- `FACE_SESSION_TTL_SECONDS`: validade da sessao facial efemera.

## Deploy Coolify

Use o `Dockerfile` para a aplicacao Next.js. Em producao, publique somente o app via HTTPS e deixe CompreFace e banco em rede privada sempre que possivel.

Para stacks multi-servico, use `docker-compose.yml` como base e ajuste a imagem/compose oficial do CompreFace conforme o ambiente da VPS.

## Criacao do primeiro admin

Depois de criar o usuario no Supabase Auth, rode:

```sql
insert into public.admin_profiles (user_id, nome, role)
values ('AUTH_USER_ID_AQUI', 'Administrador', 'admin');
```

## Checklist manual

- `/registrar` abre camera frontal em `localhost` ou HTTPS.
- Face cadastrada no admin retorna match no CompreFace.
- Sessao facial expira e nao pode ser reutilizada.
- O registro aparece em `/admin/registros`.
- Ajuste manual exige justificativa e cria auditoria.
