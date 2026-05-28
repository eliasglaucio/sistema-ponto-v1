# Genspark — Seu Workspace de IA Tudo em Um | Comece Gráti

Perfeito. Abaixo está o **blueprint técnico completo da v1** do seu sistema de ponto com reconhecimento facial, pensado para o cenário que você descreveu: desenvolvimento inicial em Windows/localhost e deploy posterior em VPS com [Coolify](https://coolify.io/docs/applications). A arquitetura proposta usa [Next.js](https://nextjs.org/docs/app/guides/self-hosting) como aplicação principal, [CompreFace](https://github.com/exadel-inc/CompreFace/blob/master/docs/Rest-API-description.md) como motor de reconhecimento facial e [PostgreSQL / Supabase](https://supabase.com/docs/guides/database/postgres/configuration) como persistência. Essa direção está alinhada com o material que você anexou no Hub e com a documentação oficial desses componentes. [Source](https://www.genspark.ai/api/files/s/IwqAkdum) [Source](https://nextjs.org/docs/app/guides/self-hosting) [Source](https://github.com/exadel-inc/CompreFace) [Source](https://coolify.io/docs/applications)

**Diagrama ilustrativo da arquitetura v1:** [Abrir diagrama técnico](https://www.genspark.ai/api/files/s/PoyAGd41?cache_control=3600)

---

## Blueprint técnico v1 — sistema de ponto facial

## 1) Visão de produto e escopo da v1

A **v1** deve resolver um fluxo simples e confiável: o colaborador abre o sistema web no celular, acessa a câmera frontal, faz a captura do rosto, é identificado pelo motor facial e, se aprovado, escolhe um dos 4 eventos de ponto: início de expediente, ida ao intervalo, volta do intervalo e saída do expediente. O backend registra o evento com os dados do colaborador e cria trilha de auditoria mínima. Em paralelo, haverá uma **área administrativa** para cadastro de colaboradores, vínculo facial, consulta de registros e gestão básica. [Source](https://www.genspark.ai/api/files/s/IwqAkdum)

A v1 não deve tentar resolver tudo de uma vez. Ela precisa focar em: captura mobile, identificação facial, regras básicas de ponto, persistência confiável, painel administrativo e deploy seguro com HTTPS. Recursos como prova de vida avançada, geofencing, integração com folha e analytics sofisticado podem ficar para v2. [Source](https://www.genspark.ai/api/files/s/IwqAkdum)

---

## 2) Arquitetura base com [Next.js](https://nextjs.org/docs/app/guides/self-hosting), [CompreFace](https://github.com/exadel-inc/CompreFace/blob/master/docs/Rest-API-description.md), [PostgreSQL / Supabase](https://supabase.com/docs/guides/database/postgres/configuration) e [Coolify](https://coolify.io/docs/knowledge-base/docker/compose)

A arquitetura recomendada para a v1 é **mobile web + backend centralizado + serviço facial separado**:

- **Frontend responsivo** no Next.js
- **Backend BFF/API** no próprio Next.js
- **Reconhecimento facial** no CompreFace
- **Banco relacional** em PostgreSQL/Supabase
- **Deploy self-hosted** na VPS via Coolify
- **SSL/HTTPS obrigatório** em produção para uso da câmera no navegador mobile [Source](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

O [Next.js](https://nextjs.org/docs/app/guides/self-hosting) suporta self-hosting em servidor Node.js e também em contêiner Docker próprio, o que encaixa bem no seu plano de subir em VPS. O [Coolify](https://coolify.io/docs/knowledge-base/docker/compose) suporta aplicações multi-serviço via Docker Compose, criando rede interna entre os serviços da stack. O [CompreFace](https://github.com/exadel-inc/CompreFace) é open source, baseado em Docker e expõe API REST para reconhecimento e gestão de subjects/faces. [Source](https://nextjs.org/docs/app/guides/self-hosting) [Source](https://coolify.io/docs/knowledge-base/docker/compose) [Source](https://github.com/exadel-inc/CompreFace)

### Topologia lógica

```
[Celular do colaborador]
        |
        | HTTPS
        v
[Next.js Web App + API]
        |                     \
        | REST                 \ SQL
        v                       v
 [CompreFace API]         [PostgreSQL / Supabase]
        |
        v
 [Base de faces / faceprints]

```

### Topologia de produção na VPS

```
[Internet]
   |
   v
[Coolify / Proxy / SSL]
   |
   +--> [Next.js app]
   +--> [CompreFace stack]
   |
   +--> [PostgreSQL local ou Supabase cloud]

```

---

## 3) Responsabilidade de cada serviço

### Matriz de serviços

| Serviço                   | Responsabilidade principal | O que faz                                                                                        | O que não faz                                   |
| ------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| **Next.js App**           | Aplicação principal        | UI mobile, API interna, regras de negócio, autenticação admin, integração com CompreFace e banco | Não executa o matching facial por conta própria |
| **CompreFace**            | Motor de reconhecimento    | Cadastro de faces, subjects, extração de faceprints, reconhecimento por imagem                   | Não conhece regras de ponto nem tela do usuário |
| **PostgreSQL / Supabase** | Persistência               | Colaboradores, eventos de ponto, auditoria, usuários admin, configurações                        | Não captura imagem nem decide match             |
| **Coolify**               | Orquestração de deploy     | Build/deploy, domínio, HTTPS, variáveis de ambiente, health check, rede entre serviços           | Não implementa regra de negócio                 |
| **Storage opcional**      | Auditoria                  | Armazenar imagem de cadastro ou snapshot de auditoria                                            | Não substitui banco relacional                  |

O [CompreFace](https://github.com/exadel-inc/CompreFace/blob/master/docs/Rest-API-description.md) possui endpoints para gerenciamento de **subjects**, exemplos faciais e reconhecimento de faces a partir de imagem enviada. Ao salvar um exemplo facial, ele calcula o embedding/faceprint e armazena isso no banco dele. O [Next.js](https://nextjs.org/docs/app/guides/self-hosting) fica responsável pela aplicação e pelas integrações; o [Coolify](https://coolify.io/docs/applications) cuida da camada operacional do deploy. [Source](https://github.com/exadel-inc/CompreFace/blob/master/docs/Rest-API-description.md) [Source](https://nextjs.org/docs/app/guides/self-hosting) [Source](https://coolify.io/docs/applications)

---

## 4) Fluxo de autenticação

Aqui existem **dois contextos de autenticação diferentes** na v1.

## 4.1 Autenticação do colaborador no registro de ponto

Na v1, o colaborador **não precisa fazer login tradicional** para registrar ponto. O mecanismo de autenticação operacional será:

1.  O colaborador acessa a rota pública
    ```
    /registrar
    ```
2.  O sistema solicita permissão de câmera
3.  O usuário captura a selfie
4.  O backend envia a imagem ao CompreFace
5.  Se houver match acima do limiar, o backend considera a identidade validada
6.  O sistema gera uma **sessão efêmera de identificação** com validade curta, por exemplo 60–120 segundos
7.  Durante essa janela, o colaborador pode escolher um dos 4 eventos e confirmar o registro
8.  Após o registro, a sessão efêmera é invalidada

Esse modelo é o mais simples para a v1 porque evita fricção de login/senha no momento do ponto, mantendo o reconhecimento facial como fator primário de autenticação operacional. O acesso à câmera no navegador mobile depende de contexto seguro, ou seja, **localhost no dev** e **HTTPS em produção**. [Source](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

### Sessão efêmera sugerida

O backend cria um token temporário, por exemplo

```
face_session_token
```

, contendo:

- ```
  employee_id
  ```
- ```
  recognized_at
  ```
- ```
  confidence_score
  ```
- ```
  expires_at
  ```
- ```
  nonce
  ```
- ```
  device_fingerprint
  ```
  opcional

Esse token **não substitui um login permanente**; ele serve apenas para fechar a transação de ponto logo após a identificação.

## 4.2 Autenticação da área administrativa

Para a área administrativa

```
/admin
```

, a recomendação da v1 é usar autenticação **separada da autenticação facial**:

- login por **e-mail e senha**
- sessão persistente com cookie HTTP-only
- perfis:
  ```
  admin
  ```
  ,
  ```
  rh
  ```
  ,
  ```
  gestor
  ```
- rotas protegidas no backend
- trilha de auditoria para ações administrativas

Se você usar Supabase como banco principal, pode usar **Supabase Auth** para admins. Se preferir tudo dentro do app, pode usar **Auth.js / session-based auth** com tabela local de usuários. Para a v1, o importante não é o provedor, e sim o desenho:

- colaborador → autenticação facial efêmera
- administrador → autenticação tradicional com RBAC

---

## 5) Fluxo funcional ponta a ponta

## 5.1 Fluxo do colaborador

```
1. Acessa /registrar
2. Clica em "Registrar ponto"
3. Browser pede permissão de câmera
4. Frontend abre câmera frontal
5. Usuário captura selfie
6. Frontend envia imagem ao backend
7. Backend chama CompreFace /recognize
8. Backend valida score mínimo
9. Backend busca colaborador no banco
10. Backend cria sessão efêmera de identificação
11. Frontend exibe nome, função, setor e eventos permitidos
12. Usuário escolhe o evento
13. Frontend chama API de registro
14. Backend valida sequência de ponto
15. Backend grava em registros_ponto
16. Backend grava audit_log
17. Frontend exibe confirmação

```

## 5.2 Fluxo administrativo

```
1. Admin acessa /admin
2. Faz login
3. Cadastra colaborador
4. Faz vínculo facial do colaborador
5. Sistema cria/atualiza subject no CompreFace
6. Admin consulta registros e exporta resultados

```

O material do Hub já sugeria esse fluxo geral: captura no cliente, processamento pesado no servidor e persistência centralizada. Isso continua sendo a melhor abordagem para segurança e consistência operacional. [Source](https://www.genspark.ai/api/files/s/IwqAkdum)

---

## 6) Módulos da aplicação

## 6.1 Módulo público de registro de ponto

**Responsabilidade:** experiência mobile do colaborador.

### Componentes

- tela inicial
- fluxo de permissão de câmera
- componente de preview da câmera
- captura de imagem
- tela de confirmação de identidade
- tela de escolha do evento
- tela de sucesso/erro

### Regras

- só usar câmera em tempo real
- preferir câmera frontal com
  ```
  facingMode: "user"
  ```
- timeout de sessão efêmera
- não permitir reuso do token após registrar

O MDN documenta explicitamente o uso de

```
facingMode
```

para preferir câmera frontal em mobile. [Source](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## 6.2 Módulo de reconhecimento facial

**Responsabilidade:** orquestrar comunicação com o CompreFace.

### Funções

- receber imagem da captura
- normalizar formato de envio
- chamar endpoint de reconhecimento
- aplicar threshold mínimo
- extrair melhor match
- mapear
  ```
  subject
  ```
  do CompreFace para
  ```
  colaborador_id
  ```
  interno
- retornar identidade reconhecida ao fluxo de ponto

## 6.3 Módulo de ponto

**Responsabilidade:** registrar os 4 eventos válidos.

### Eventos

- ```
  inicio_expediente
  ```
- ```
  ida_intervalo
  ```
- ```
  volta_intervalo
  ```
- ```
  saida_expediente
  ```

### Regras mínimas da v1

- não permitir
  ```
  saida_expediente
  ```
  sem
  ```
  inicio_expediente
  ```
- não permitir
  ```
  volta_intervalo
  ```
  sem
  ```
  ida_intervalo
  ```
- não permitir duplicidade indevida no mesmo dia
- sempre registrar
  ```
  timestamp
  ```
  em UTC
- guardar score de reconhecimento no log do evento

O [Supabase](https://supabase.com/docs/guides/database/postgres/configuration) recomenda manter o banco em UTC por padrão. [Source](https://supabase.com/docs/guides/database/postgres/configuration)

## 6.4 Módulo administrativo

**Responsabilidade:** gestão do sistema.

### Telas

- login admin
- dashboard básico
- cadastro/edição de colaborador
- cadastro facial
- consulta de registros
- filtros por data, colaborador, setor, evento
- exportação CSV na v1.1 ou v1.2

## 6.5 Módulo de auditoria

**Responsabilidade:** rastreabilidade.

### Itens auditáveis

- tentativas de reconhecimento
- registros de ponto efetivados
- erros de match
- alterações cadastrais de colaboradores
- alterações administrativas
- revogação/desativação de usuários

---

## 7) Integrações

## 7.1 Integração com [CompreFace](https://github.com/exadel-inc/CompreFace/blob/master/docs/Rest-API-description.md)

A integração central da v1 é com o CompreFace. A documentação oficial descreve endpoints de:

- gerenciamento de **subjects**
- gerenciamento de **subject examples**
- reconhecimento de faces por imagem
- verificação e operações relacionadas [Source](https://github.com/exadel-inc/CompreFace/blob/master/docs/Rest-API-description.md)

### Modelo de integração recomendado

**No cadastro facial**

1.  Criar ou garantir existência do
    ```
    subject
    ```
    do colaborador
2.  Enviar 1 a 3 imagens de cadastro
3.  Armazenar no seu banco: - `       colaborador_id
      `
    11. ```
        compreface_subject
        ```
    12. ```
        status_cadastro_facial
        ```

**No registro de ponto**

1.  Receber selfie
2.  Chamar endpoint de reconhecimento
3.  Receber subject e score
4.  Mapear para colaborador interno
5.  Continuar o fluxo

### Convenção de subject

Use um subject previsível, por exemplo:

```
employee:{uuid}

```

Exemplo:

```
employee:8b3f4d1d-....

```

Assim o retorno do CompreFace já identifica com segurança o colaborador do banco interno.

## 7.2 Integração com banco [PostgreSQL / Supabase](https://supabase.com/docs/guides/database/postgres/configuration)

O banco da v1 deve armazenar:

- cadastro de colaboradores
- registros de ponto
- usuários admin
- trilha de auditoria
- configuração do sistema
- vínculo lógico com o subject do CompreFace

## 7.3 Integração com storage

Opcional na v1, mas recomendável:

- armazenar foto de cadastro
- armazenar snapshot de auditoria de tentativas relevantes
- guardar somente o mínimo necessário, com política de retenção

## 7.4 Integração operacional com [Coolify](https://coolify.io/docs/knowledge-base/docker/compose)

Em produção, o [Coolify](https://coolify.io/docs/applications) será responsável por:

- deploy do app Next.js
- deploy do CompreFace via Docker Compose ou imagem
- configuração de domínio
- HTTPS forçado
- variáveis de ambiente
- health checks
- rede entre containers [Source](https://coolify.io/docs/applications) [Source](https://coolify.io/docs/knowledge-base/docker/compose)

---

## 8) Modelo de dados da v1

## 8.1 Tabela

```
colaboradores
```

```
create table colaboradores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  funcao text not null,
  setor text not null,
  matricula text unique,
  compreface_subject text unique not null,
  ativo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

```

## 8.2 Tabela

```
registros_ponto
```

```
create table registros_ponto (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  evento text not null check (
    evento in (
      'inicio_expediente',
      'ida_intervalo',
      'volta_intervalo',
      'saida_expediente'
    )
  ),
  registrado_em timestamptz not null default timezone('utc', now()),
  score_reconhecimento numeric(5,2),
  origem text not null default 'mobile_web',
  face_session_id uuid,
  observacao text
);

```

## 8.3 Tabela

```
usuarios_admin
```

```
create table usuarios_admin (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'rh', 'gestor')),
  ativo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

```

## 8.4 Tabela

```
audit_logs
```

```
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null, -- admin, colaborador, sistema
  actor_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

```

## 8.5 Tabela

```
face_sessions
```

```
create table face_sessions (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  confidence_score numeric(5,2) not null,
  recognized_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  status text not null check (status in ('active', 'consumed', 'expired', 'revoked'))
);

```

---

## 9) Contratos de API da v1

## 9.1

```
POST /api/face/identify
```

**Entrada**

- imagem capturada
- device metadata opcional

**Saída**

```
{
  "success": true,
  "faceSessionId": "uuid",
  "employee": {
    "id": "uuid",
    "nome": "João Silva",
    "funcao": "Auxiliar",
    "setor": "Operações"
  },
  "allowedEvents": [
    "inicio_expediente",
    "ida_intervalo"
  ],
  "confidence": 96.12
}

```

## 9.2

```
POST /api/ponto/register
```

**Entrada**

```
{
  "faceSessionId": "uuid",
  "evento": "inicio_expediente"
}

```

**Saída**

```
{
  "success": true,
  "registro": {
    "id": "uuid",
    "evento": "inicio_expediente",
    "registradoEm": "2026-05-27T11:02:00Z"
  }
}

```

## 9.3

```
POST /api/admin/colaboradores
```

Cadastra colaborador.

## 9.4

```
POST /api/admin/colaboradores/:id/face-enroll
```

Faz o vínculo facial do colaborador com o CompreFace.

## 9.5

```
GET /api/admin/registros
```

Lista registros com filtros.

---

## 10) Regras de negócio da v1

As regras mais importantes da v1 devem ficar **no backend**, nunca só no frontend.

### Regras essenciais

- um colaborador precisa estar
  ```
  ativo
  ```
- precisa haver match facial acima do threshold
- a sessão efêmera precisa estar
  ```
  active
  ```
- a sessão efêmera só pode registrar **um único evento**
- o evento precisa ser permitido conforme o estado atual do dia
- o registro precisa usar horário do servidor/banco, não do celular

### Máquina de estados simplificada por dia

```
SEM_REGISTRO
  -> inicio_expediente
EM_EXPEDIENTE
  -> ida_intervalo
EM_INTERVALO
  -> volta_intervalo
EM_EXPEDIENTE_POS_INTERVALO
  -> saida_expediente
FINALIZADO
  -> nenhum

```

### Regras adicionais recomendadas

- impedir dois
  ```
  inicio_expediente
  ```
  no mesmo dia, salvo exceção administrativa
- permitir correção manual só por admin/RH
- registrar toda correção em
  ```
  audit_logs
  ```

---

## 11) Responsabilidades internas do backend [Next.js](https://nextjs.org/docs/app/guides/self-hosting)

O backend da aplicação no Next.js pode ser organizado em camadas:

###

```
app/
```

Responsável pelas rotas e telas.

###

```
modules/auth
```

Autenticação admin, sessão e autorização por perfil.

###

```
modules/face-recognition
```

Adapter do CompreFace, parsing de respostas, threshold e criação de

```
face_session
```

.

###

```
modules/timekeeping
```

Regras de ponto, validação de sequência, persistência e consulta do status diário.

###

```
modules/employees
```

Cadastro, ativação, desativação e vínculo com subject.

###

```
modules/audit
```

Registro de eventos técnicos e administrativos.

###

```
lib/db
```

Cliente do banco e repositórios.

###

```
lib/config
```

Variáveis de ambiente e configuração do sistema.

O [Next.js](https://nextjs.org/docs/app/getting-started/deploying) suporta self-hosting completo em servidor Node.js e Docker, então essa centralização no próprio app é adequada para a v1. [Source](https://nextjs.org/docs/app/getting-started/deploying)

---

## 12) Segurança, privacidade e [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

Como o sistema usa reconhecimento facial, ele trata **dado biométrico vinculado a pessoa natural**, que a LGPD classifica como **dado pessoal sensível** no art. 5º, II. A própria ANPD destaca que o uso de biometria e reconhecimento facial demanda cuidados com base legal, proporcionalidade, segurança, governança e direitos dos titulares, inclusive em ambientes de trabalho. [Source](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) [Source](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-abre-tomada-de-subsidios-sobre-tratamento-de-dados-biometricos)

### Controles mínimos da v1

- HTTPS obrigatório
- secrets só no backend
- cookie admin HTTP-only e secure
- logs sem expor imagem/base64 integral
- retenção mínima de snapshots
- trilha de auditoria
- separação de perfis administrativos
- desativação imediata de colaborador
- revisão jurídica interna antes de produção

---

## 13) Ambientes

## 13.1 Desenvolvimento local no Windows

### Stack local

- Next.js com
  ```
  npm run dev
  ```
- CompreFace via Docker Desktop
- Postgres local via Docker ou Supabase cloud

O

```
getUserMedia()
```

funciona em **localhost**, o que facilita testes da câmera sem HTTPS durante o desenvolvimento. [Source](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

### Variáveis de ambiente sugeridas

```
APP_ENV=development
APP_URL=http://localhost:3000

DATABASE_URL=postgresql://...
COMPRE_FACE_URL=http://localhost:8000
COMPRE_FACE_API_KEY=...

AUTH_SECRET=...
TIMEZONE_DEFAULT=UTC
FACE_MATCH_THRESHOLD=90
FACE_SESSION_TTL_SECONDS=120

```

## 13.2 Produção na VPS com [Coolify](https://coolify.io/docs/applications)

### Stack recomendada

- ```
  nextjs-app
  ```
- ```
  compreface
  ```
- ```
  postgres
  ```
  opcional local
- ou
  ```
  Supabase cloud
  ```
  externo

O [Coolify](https://coolify.io/docs/applications) suporta buildpacks, Dockerfile, Docker Compose e imagens prontas. Para aplicações complexas, a própria documentação recomenda deploy baseado em Docker Compose. Além disso, o Coolify força HTTPS por padrão e gerencia containers em rede isolada, o que é ideal para o app e o serviço facial conversarem de forma privada. [Source](https://coolify.io/docs/applications) [Source](https://coolify.io/docs/knowledge-base/docker/compose)

---

## 14) Responsabilidade de infraestrutura em produção

### Coolify

- build e deploy
- domínio e SSL
- env vars
- health checks
- restart policy
- rede entre serviços
- observabilidade básica de deploy

### VPS

- CPU/RAM suficientes para app + CompreFace
- disco para imagens/logs
- backup do banco
- atualização do sistema operacional

### Banco

- persistência
- backup
- índices
- integridade referencial
- timezone em UTC [Source](https://supabase.com/docs/guides/database/postgres/configuration)

---

## 15) Critérios de aceite da v1

A v1 pode ser considerada pronta quando cumprir este checklist:

- colaborador consegue acessar o app no celular
- câmera frontal abre com permissão do navegador
- selfie é enviada ao backend
- backend identifica colaborador via CompreFace
- sistema exibe nome/função/setor corretos
- colaborador consegue registrar um dos 4 eventos
- registro é salvo com timestamp UTC
- admin consegue cadastrar colaborador
- admin consegue vincular face
- admin consegue consultar registros
- tudo roda em localhost e depois em VPS com HTTPS

---

## 16) Blueprint resumido em uma frase

A **v1** deve ser uma aplicação **Next.js mobile-first**, com **autenticação facial efêmera para o colaborador**, **autenticação tradicional para admins**, **CompreFace como serviço isolado de reconhecimento**, **PostgreSQL/Supabase como fonte de verdade**, e **Coolify na VPS** como camada de deploy, rede interna e HTTPS. [Source](https://nextjs.org/docs/app/guides/self-hosting) [Source](https://github.com/exadel-inc/CompreFace/blob/master/docs/Rest-API-description.md) [Source](https://coolify.io/docs/knowledge-base/docker/compose)

---

## Referências visuais e técnicas

- Diagrama técnico gerado para esta arquitetura: [Abrir imagem](https://www.genspark.ai/api/files/s/PoyAGd41?cache_control=3600)
- Documento do Hub com a stack sugerida: [Abrir arquivo](https://www.genspark.ai/api/files/s/IwqAkdum)
- Documentação de self-hosting do Next.js: [Next.js](https://nextjs.org/docs/app/guides/self-hosting)
- Deploy e containers no Coolify: [Coolify Applications](https://coolify.io/docs/applications)
- Rede entre serviços com Docker Compose no Coolify: [Coolify Docker Compose](https://coolify.io/docs/knowledge-base/docker/compose)
- API REST do CompreFace: [CompreFace REST API](https://github.com/exadel-inc/CompreFace/blob/master/docs/Rest-API-description.md)
- Uso de câmera no navegador mobile: [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- UTC no banco: [Supabase Postgres Configuration](https://supabase.com/docs/guides/database/postgres/configuration)
- LGPD biometria sensível: [Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

Se quiser, no próximo passo eu posso transformar esse blueprint em um destes formatos:

- **estrutura de pastas do projeto Next.js**
- **DDL SQL completa do banco**
- **lista de rotas e contratos de API**
- **plano de implementação por sprint**
- **docker-compose inicial para localhost**
- **backlog técnico da v1 em ordem de execução**
