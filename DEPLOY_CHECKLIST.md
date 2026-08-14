# Checklist de Deploy — Royal Arena no Netlify

## 1. Variáveis de ambiente pra configurar no Netlify

No painel do site → **Site configuration → Environment variables**, adiciona:

| Nome | Obrigatória? | O que é |
|---|---|---|
| `DATABASE_URL` | ✅ Sim | A URL de conexão do Postgres (Neon ou Supabase — copia inteira, já vem com usuário/senha) |
| `ADMIN_PASSWORD` | ✅ Sim | Senha que a liderança usa pra acessar o painel admin do Arena Tracker (você escolhe, pode ser qualquer senha forte) |
| `VITE_PIX_CODE` | ❌ Opcional | Só se quiser mostrar um código PIX de doação na página "Sobre" do site. Se não usar, deixa sem configurar |

**Não precisa configurar** (deixados de propósito):
- `VITE_API_URL` — como frontend e API ficam no mesmo site agora, o padrão (`/api`) já funciona sozinho
- `WEB_URL` — só era necessário quando API e frontend eram sites separados
- `PORT` — só usado no desenvolvimento local, o Netlify não usa

## 2. Conectando o repositório

1. Netlify → **Add new site → Import an existing project**
2. Conecta com o GitHub, escolhe o repositório `wyd-global-arena`
3. Confirma que o `netlify.toml` já está sendo detectado (ele já define o comando de build e a pasta de publicação sozinho — não precisa preencher nada manual nessa tela)

## 3. Primeiro deploy

- A migração do banco (criar as tabelas) roda **automaticamente** todo deploy, então não precisa fazer nada manual aqui
- Se o `DATABASE_URL` estiver certo, o primeiro deploy já deixa o banco pronto e o site no ar

## 4. Depois que estiver no ar

- Confirma que `/api/health` responde `{"status":"ok"}` (é a rota de teste mais simples)
- No painel do Netlify → **Functions**, confere se aparecem as 6 funções agendadas com a etiqueta "Scheduled"
- Testa entrar no painel admin com a `ADMIN_PASSWORD` que você escolheu, e clica em "sincronizar manualmente" pra ver se puxa dado de verdade da API do jogo

## 5. Domínio (opcional, mas recomendado)

Se quiser usar `arena.impwyd.com` em vez do endereço `.netlify.app`:
1. Netlify → **Domain management → Add a domain**
2. Segue o mesmo processo que já fizemos com `portal.impwyd.com`
3. Depois disso, é só eu trocar o link do botão "Royal Arena" no site de presença pro endereço definitivo

---

**Se der erro em qualquer passo**, me manda a mensagem de erro exata (print da tela ou texto) que eu identifico a causa.
