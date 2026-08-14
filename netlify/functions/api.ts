// Netlify Function que serve a API inteira (todas as rotas: /arenas, /players,
// /rankings, /sync, /seasons, /auth, /level, /stats, /loki).
//
// O Hono já fala a linguagem padrão da web (Request/Response), então não precisa
// de nenhum "adaptador" especial — só repassa o pedido direto pro app.
//
// No painel do Netlify, essa função fica acessível em:
//   /.netlify/functions/api/<rota>
// O netlify.toml (na raiz do projeto) redireciona /api/* pra cá, então o
// frontend pode chamar só /api/arenas, /api/players, etc.
import { app } from '../../apps/api/src/app';

export default async (req: Request) => {
  // As rotas internas do Hono são registradas sem o prefixo /api (ex: /arenas,
  // /players). O Netlify entrega o pedido com /api na frente (por causa do
  // "path" configurado abaixo), então tiramos esse prefixo antes de repassar.
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/api/, '') || '/';
  const rewritten = new Request(url.toString(), req);
  return app.fetch(rewritten);
};

export const config = {
  path: '/api/*',
};
