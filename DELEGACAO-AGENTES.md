# Delegação de agentes — conclusão das quatro áreas

## Coordenação e responsabilidades

| Agente | Responsabilidade nesta entrega | Resultado esperado |
|---|---|---|
| BUILD | Coordenar escopo, sequência, integração e critérios de aceite | Quatro áreas integradas sem alterar a identidade existente |
| ERER Researcher | Revisar biografias, conceitos, contexto cultural e fontes | Conteúdo cuidadoso, contextualizado e com referências para aprofundamento |
| UI/UX Designer | Preservar a direção editorial; revisar hierarquia, estados e responsividade | Componentes consistentes, legíveis e acessíveis |
| Frontend Specialist | Implementar navegação, filtros, abas, glossário e quiz | HTML/CSS/JS funcionais, sem frameworks |
| QA & Performance | Testar interações, erros e layouts | Relatório de validação e pendências |

## Escopo implementado

1. **Protagonismo e História:** seis perfis, filtros por afro-brasileiros/indígenas e nota de cautela documental.
2. **Cultura e Conhecimento:** abas para oralidade/literatura, ciência/tecnologia, território/natureza e artes/expressões.
3. **Aprendizado · Glossário:** seis verbetes, busca em tempo real, limpeza e estado sem resultados.
4. **Quiz:** cinco questões, feedback explicativo, pontuação, progresso e reinício.

## Arquivos alterados

- `index.html` — navegação e estrutura das quatro áreas.
- `style.css` — componentes e responsividade, preservando os tokens e a linguagem visual existentes.
- `script.js` — navegação ativa, filtros, abas, busca e lógica do quiz.
- `.opencode/agents/` — definições dos agentes previstos no Plano.md, além do agente de design já existente.

## Validação realizada

- `node --check script.js`: aprovado.
- HTML analisado com `HTMLParser`: sem erro de parsing reportado.
- Teste automatizado em Chromium: busca do glossário (filtra e limpa), filtro de personalidades, resposta e feedback do quiz, conclusão com pontuação 5/5 e ausência de erros JavaScript: aprovado.
- Verificação de overflow horizontal em viewport desktop: aprovado.

## Revisão editorial pendente antes da publicação

As referências aparecem como instituições e obras para aprofundamento, mas ainda devem receber URLs específicas e validação humana final. O rodapé também mantém os campos `[nome 1] · [nome 2] · [nome 3]`, que precisam ser substituídos pelos nomes reais da equipe. A origem/autoria dos retratos existentes permanece em verificação, conforme já indicado no projeto.
