# TALIS · frontend (redesign)

Novo frontend do painel TALIS em React 19 + Vite + Motion. Ele usa a mesma API do app atual:
rotas em `/api`, token Bearer salvo em `localStorage` com a chave `talis_token` e as mesmas URLs
(`/`, `/admin`, `/admin/empresas`, `/admin/usuarios`).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5180
```

Em desenvolvimento, `/api` é encaminhado para `https://talis.devmais.com`. Para usar uma API local:

```bash
TALIS_API=http://localhost:3333 npm run dev
```

Na tela de login, o botão **"Ver com dados de demonstração"** abre o painel com dados fictícios
(`src/demo.js`). Esse botão só aparece em desenvolvimento e não vai para o build.

## Publicar

```bash
npm run build      # gera dist/
```

Troque o conteúdo do frontend atual pelo `dist/`. O servidor precisa mandar todas as rotas para o
`index.html` (SPA) e continuar servindo `/api` como hoje.

## Estrutura

- `src/api.js`: chamadas à API, rótulos (papéis, status) e formatação
- `src/styles.css`: design system (paleta, botões, campos, tabelas, shell)
- `src/screens.css`: estilos de cada tela
- `src/components/ui.jsx`: Page, Modal, Drawer, Menu, Toast, diálogos (`ask.confirm` / `ask.prompt`)
- `src/components/charts.jsx`: gráfico de área, sparkline, anel e barra empilhada (SVG)
- `src/pages/*`: as telas

Paleta: `#262626` `#8C8C8C` `#BFBFBD` `#E9E5DC` `#F2EFE9`.
Fontes: Cinzel (títulos, mesma da logo) e Inter (texto e números). Ornamentos gregos (meandro e caneluras) em `src/screens.css`, seção "Pegada grega".

## Logo

Variantes em `Design/logo` (SVG e PNG): completa, só ícone, só texto, horizontal e ícone de app.
Para gerar tudo de novo (inclusive `src/brand.js`, `public/favicon.svg` e os ícones de app):

```bash
node tools/logo.mjs
```

## Landing page

Fica em `site/index.html` (código em `src/site`). Em desenvolvimento: http://localhost:5180/site/

- Busto 3D: escaneamento "Herm of Plato" do Three D Scans (threedscans.com), domínio público, otimizado para `public/models/plato.glb` (~570 KB) com obj2gltf + gltf-transform (simplify + meshopt).
- Imagens das estátuas: `public/site` (geradas por `node tools/site-images.mjs <busto> <leitor>`).
- Links "Entrar" e "Começar" apontam para o painel. Em produção defina `VITE_APP_URL` (ex.: https://app.seudominio.com.br). `?cadastro` abre o painel direto em "Criar conta".
