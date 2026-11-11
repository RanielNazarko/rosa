# Sobre Etnias — Especificação de Design (UI/UX)

Documento de referência para implementação e revisão visual.
Etapa atual: **tela de entrada** (`index.html`, `style.css`, `script.js`).

---

## 1. Conceito

**"Abrir o arquivo."** A entrada funciona como a abertura de um acervo editorial
em duas etapas: primeiro um **fólio fechado se abre em duas folhas** e revela,
frente a frente, as duas personalidades do acervo; em seguida o fólio sai de cena
e a **tela de entrar** se monta — o nome é impresso diante dos olhos, os retratos
surgem como medalhões e o CTA espera o clique. A saída é uma cortina que se abre
em duas metades.

Metáfora central: **memória documental** — não é uma abertura "tecnológica",
é uma capa de livro/acervo que se abre.

---

## 2. Paleta

Tema **escuro editorial**: fundo de papel queimado, tinta creme e acentos
terrosos rebaixados. As relações de contraste foram recalculadas para o fundo
escuro (ver §7).

| Papel | Token | Hex | Uso |
|---|---|---|---|
| Fundo principal | `--cor-fundo` | `#171110` | plano de fundo geral |
| Fundo elevado | `--cor-fundo-alto` | `#221A16` | luz do gradiente radial |
| Fundo sombreado | `--cor-fundo-baixo` | `#100B0A` | rodapé, base do gradiente |
| Superfície | `--cor-superficie` | `#2A211C` | moldura vazia dos retratos |
| Texto principal | `--cor-texto` | `#F2E8D9` | títulos e corpo (contraste ~15,4:1) |
| Texto secundário | `--cor-texto-suave` | `#C7B5A1` | legendas, textos longos (~9,4:1) |
| Destaque | `--cor-destaque` | `#CE6A45` | terracota sóbria: "Etnias", selo, foco (~5,1:1) |
| Destaque escuro | `--cor-destaque-esc` | `#A9502C` | estados ativos, futuros preenchimentos |
| Ouro queimado | `--cor-ouro` | `#C09555` | fios, anel, numeração (~6,8:1) |
| Ouro claro | `--cor-ouro-claro` | `#E0C892` | realces pontuais |
| Verde profundo | `--cor-verde` | `#2C6152` | véu do retrato, futuro eixo de conteúdo |
| Linha | `--cor-linha` | `rgba(242,232,217,.14)` | divisórias de 1px |

Regras:
- No escuro, o **creme é a tinta** e o **terracota é o acento** — o fundo creme
  deixou de existir; nenhum bloco grande é terracota.
- Terracota foi clareado de `#B04E27` para `#CE6A45`: o tom original caía para
  ~3,5:1 sobre o novo fundo e não servia para rótulos pequenos.
- Ouro agora passa AA até em texto pequeno, mas continua preferencialmente
  ornamental (fios, numeração, molduras).
- Nenhuma cor comunica estado sozinha (ver §7).

---

## 3. Tipografia

| Papel | Stack | Observação |
|---|---|---|
| Títulos | `"Bodoni MT", Didot, "Playfair Display", Georgia, "Times New Roman", serif` | alto contraste editorial; presente no Windows |
| Corpo/UI | `"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif` | leitura confortável, sem dependência externa |

- **Zero fontes externas**: nenhum Google Fonts, nenhuma requisição de rede.
- Escala do título de entrada: `clamp(3.1rem, 10.5vw, 8.25rem)`, `line-height: .88`,
  `letter-spacing: -.025em`.
- "Sobre" em marrom, "Etnias" em itálico terracota (contraste tipográfico).
- Rótulos e legendas: caixa alta + `letter-spacing` entre `.13em` e `.34em`.
- Corpo de texto longo: `max-width: 62ch`, `line-height: 1.7`.

---

## 4. Layout da entrada

A entrada tem **duas etapas**: o fólio que se abre (§4.1) e a tela de entrar (§4.2).

### 4.1 Etapa 1 — o fólio se abre em duas folhas

Um volume fechado (capa de couro e ouro) ocupa o centro da tela. Duas folhas
viram em sequência, cada uma em torno da lombada central:

```
 [capa fechada]  →  capa vira 180°  →  guarda vira 180°  →  espalhamento
                                                              ╭───────┬───────╮
                                                              │retrato│retrato│
                                                              │   A   │   B   │
                                                              ╰───────┴───────╯
```

- **Geometria:** o espalhamento mede `min(92vw, 980px, 118vh)` com proporção `3/2`
  (celular: `min(94vw, 68vh)` e `4/5`). O livro fechado é a metade direita; a cena
  começa deslocada em `translate: -25%` e centraliza quando a capa abre.
- **Camadas em 3D:** `perspective: 3000px` no palco, `preserve-3d` na cena, no
  volume e nas folhas. Cada folha tem `transform-origin: left center` e um
  `translateZ` próprio (capa 6px→2px, guarda 3px→6px) para não haver z-fighting
  e para a guarda passar à frente depois de virada.
- **Faces:** cada folha é um cartão de duas faces (`backface-visibility: hidden`).
  A capa mostra couro com emblema, "Sobre Etnias", fio de ouro e selo; a guarda
  mostra a página de rosto; o verso da guarda e a página direita recebem as
  pranchas dos retratos.
- **Páginas:** fundo de papel escuro (gradiente quente) com grão herdado da
  entrada, moldura dourada de 1px nas bordas externas e sombra de lombada
  (gradiente de 22% de largura) dos dois lados do centro.
- **Pranchas:** retrato em `object-fit: cover` com o mesmo tratamento duotônico
  dos medalhões, legenda em versalete (nome em itálico + nota).
- O fólio é **decorativo**: `aria-hidden="true"`, sem foco, e some assim que a
  etapa 2 começa. Clicar, teclar Tab/Esc/Enter/Espaço adianta a abertura.

### 4.2 Etapa 2 — a tela de entrar

Tríptico editorial:

```
            [ selo institucional ]
[retrato]      SOBRE / ETNIAS      [retrato]
              lema + fio de ouro
        [CTA]  +  pular introdução
```

- Grid de 3 colunas: `auto | 1fr | auto`, `perspective` aplicada no próprio retrato.
- Retratos: arco (moldura `999px 999px 10px 10px`), proporção `3/4`,
  largura `clamp(132px, 16.5vw, 226px)`, deslocamento vertical alternado
  (esquerda +14px, direita −10px) para ritmo editorial.
- Moldura dupla: contorno ouro a 7px de distância + linha interna branca.
- Tratamento duotônico: `grayscale + sepia` na imagem e véu terracota/verde
  em `mix-blend-mode: multiply`.
- Fundo: gradiente radial de marrom-carvão + **grão de papel** em SVG embutido
  (`feTurbulence`) a 6% de opacidade, em `mix-blend-mode: screen` (no tema escuro
  o grão precisa clarear, não escurecer). Nenhuma imagem de textura externa.

## 5. Movimento (linha do tempo)

### Etapa 1 — fólio (só sem `prefers-reduced-motion`)

| Tempo | O que acontece |
|---|---|
| 0,05–0,75s | o volume fechado surge no centro |
| 0,40s | **capa** vira 180° em 0,85s (`--ease-folha`) |
| 0,82s | **guarda** vira 180° em 0,85s, quando a capa está de perfil |
| 1,45s | legendas das pranchas aparecem |
| 2,30s | o fólio sai (fade + leve zoom, 0,55s) e a etapa 2 começa |

### Etapa 2 — entrada (a partir de 2,30s)

| Tempo | O que acontece |
|---|---|
| +0,05s | selo institucional surge; anel decorativo aparece |
| +0,10–1,0s | letras do nome sobem por trás da máscara, uma a uma (40ms) com `rotateX` |
| +0,72s | fio dourado se abre sob o título |
| +0,82s | lema surge |
| +0,50s / +0,60s | retratos entram (translate + scale + blur) e a foto "revela" |
| +1,05s | CTA e "pular introdução" aparecem |
| contínuo | anel tracejado gira em 90s; parallax 3D segue o ponteiro |
| clique | conteúdo sobe e desfoca (0,42s) → cortina se divide (0,9s) → página |

As animações da etapa 2 ficam **pausadas** (`animation-play-state`) até
`.entrada.is-pronta`; assim a montagem da entrada só corre depois do fólio.

Diretrizes:
- Tudo em CSS (`@keyframes`), sem bibliotecas e sem `requestAnimationFrame`
  para a animação de entrada.
- Parallax: `pointermove` com `requestAnimationFrame` + variáveis CSS
  (`--px`, `--py`, `--dz`), só em ponteiro fino (`hover: hover`).
- `will-change` apenas onde há animação real.
- Nenhuma animação de layout (só `transform`, `opacity`, `filter`).

## 6. Componentes e estados

| Componente | Estados |
|---|---|
| Botão principal | repouso (creme com texto escuro), hover (terracota sobe de baixo, seta desliza), active (afunda 1,5%), foco (anel terracota 2px/offset 3px), disabled |
| Link "pular" | repouso (texto suave), hover (marrom + fio ouro), foco |
| Retrato | entrada animada, hover (opcional: levantar o véu), foco não se aplica (não é interativo) |
| Item de índice | repouso, hover (fio ouro) — apenas nas etapas seguintes |
| Campo de busca (futuro) | vazio, digitando, sem resultados |

## 7. Acessibilidade

- Diálogo de entrada: `role="dialog"`, `aria-modal="true"`, `aria-label`,
  `aria-busy="true"` até o fólio terminar (`false` depois).
- Fólio: `aria-hidden="true"`, sem foco; Tab/Enter/Espaço/Esc adiantam para a
  etapa 2 (o Tab já leva o foco ao CTA).
- Os botões da entrada ficam `visibility: hidden` durante a abertura, fora da
  árvore de foco e de acessibilidade.
- Conteúdo de trás recebe `inert` enquanto a cortina está fechada.
- Foco inicial no diálogo (não no botão) para não simular foco de teclado.
- Confinamento de foco entre os dois botões (Tab / Shift+Tab).
- `Esc` encerra a introdução; ao sair, o foco vai para o `h2` do início.
- Título decorativo do nome é `aria-hidden`; o nome acessível vem do `aria-label`.
- Contraste (fundo escuro): principal ~15,4:1; secundário ~9,4:1; acento
  terracota ~5,1:1 (vale para rótulos pequenos); botão creme com texto escuro
  ~15,4:1; hover terracota com texto escuro ~5,1:1.
- Foco sempre visível (`:focus-visible`) com offset.
- `prefers-reduced-motion`: animações desativadas, estados finais garantidos,
  parallax desligado, "pular" oculto no modo compacto.
- Sem rolagem horizontal (`overflow-x: clip` + `scrollbar-gutter: stable`).

## 8. Breakpoints

| Faixa | Largura | Comportamento |
|---|---|---|
| Fólio | ≤ 700px | livro de mão: proporção `4/5`, largura `min(94vw, 68vh)` |
| Celular | ≤ 520px | selo empilhado, título 15vw, retratos lado a lado (cauda menor), CTA compacto |
| Tablet | ≤ 860px | retratos descem para uma linha própria, `transform` 3D desligado |
| Desktop | > 860px | tríptico completo, parallax ativo |
| Paisagem baixa | alt. ≤ 560px | anel e lema ocultos, retratos reduzidos a 15vh |

## 9. Pendências de conteúdo

- [ ] Nomes reais dos integrantes no rodapé (`[nome 1] · [nome 2] · [nome 3]`).
- [ ] Origem e autoria dos retratos (créditos de imagem).
- [ ] **Dandara dos Palmares não possui retrato autêntico.** A foto fornecida é o
      retrato numerado ("518") de uma mulher escravizada não identificada — foi usada
      como medalhão temático "Resistência", não como Dandara. Para representá-la,
      produzir uma **ilustração assumidamente ilustrativa**, com legenda de contexto.
- [ ] Substituir a lista "em preparação" pelas seções reais.

## 10. Otimização

- Retratos convertidos para JPG, ~50 KB cada, `width`/`height` declarados.
- `preload` das duas imagens da entrada.
- Sem framework, sem build, sem requisição externa.
