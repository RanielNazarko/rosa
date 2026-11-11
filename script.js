/* ============================================================
   SOBRE ETNIAS — comportamento
   ------------------------------------------------------------
   1. Entrada em duas etapas
      1a. o fólio se abre em duas folhas
      1b. a tela de entrar aparece e espera o clique
   2. Paralaxe 3D dos retratos
   3. Utilidades
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     1. ENTRADA EM DUAS ETAPAS
     ------------------------------------------------------------ */
  var entrada     = document.getElementById('entrada');
  var folio       = document.getElementById('folio');
  var pagina      = document.getElementById('pagina');
  var btnEntrar   = document.getElementById('btn-entrar');
  var btnPular    = document.getElementById('btn-pular');
  var tituloHeroi = document.getElementById('titulo-inicio');

  var SEM_MOVIMENTO = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Durações que precisam acompanhar o CSS */
  var DURACAO_SAIDA = 900;   /* .entrada.is-saindo (cortina) */
  var DURACAO_FOLIO = 550;   /* .folio.is-fora */

  /* Roteiro do fólio (ms). Cada folha leva 850 ms para virar; a
     guarda parte quando a capa está de perfil (metade do giro). */
  var T_CAPA    = 400;
  var T_GUARDA  = 820;
  var T_LEGENDA = 1450;
  var T_ENTRADA = 2300;

  var saindo = false;
  var pronta = false;
  var temporizadores = [];

  function reduzirMovimento() {
    return SEM_MOVIMENTO.matches;
  }

  function agendar(acao, atraso) {
    temporizadores.push(window.setTimeout(acao, atraso));
  }

  function cancelarAgenda() {
    temporizadores.forEach(window.clearTimeout);
    temporizadores = [];
  }

  /* Bloqueia a página de trás enquanto a entrada está aberta:
     o atributo inert remove os elementos do foco e da árvore de
     acessibilidade sem escondê-los visualmente. */
  function prenderPagina() {
    if (!pagina) return;
    pagina.setAttribute('inert', '');
    document.body.classList.add('travado');
  }

  function liberarPagina() {
    if (!pagina) return;
    pagina.removeAttribute('inert');
    document.body.classList.remove('travado');
  }

  /* Etapa 2: o fólio sai de cena e a entrada começa a se montar */
  function revelarEntrada() {
    if (pronta || !entrada) return;
    pronta = true;
    cancelarAgenda();

    entrada.classList.add('is-pronta');
    entrada.setAttribute('aria-busy', 'false');

    if (folio && !folio.hidden) {
      folio.classList.add('is-fora');

      if (reduzirMovimento()) {
        folio.hidden = true;
      } else {
        window.setTimeout(function () { folio.hidden = true; }, DURACAO_FOLIO);
      }
    }
  }

  function sair() {
    if (saindo || !entrada) return;
    saindo = true;

    if (btnEntrar) btnEntrar.disabled = true;
    if (btnPular) btnPular.disabled = true;

    window.scrollTo(0, 0);
    pararParalaxe();

    if (reduzirMovimento()) {
      concluir();
      return;
    }

    entrada.classList.add('is-saindo');
    window.setTimeout(concluir, DURACAO_SAIDA);
  }

  function concluir() {
    if (entrada) {
      entrada.hidden = true;
      entrada.classList.remove('is-saindo');
    }

    liberarPagina();

    if (pagina) pagina.classList.add('revelada');

    /* Move o foco para o início do conteúdo, para quem navega
       por teclado ou leitor de tela não voltar ao topo. */
    if (tituloHeroi) {
      tituloHeroi.focus({ preventScroll: true });
    }
  }

  if (entrada && btnEntrar) {
    prenderPagina();

    btnEntrar.addEventListener('click', sair);
    if (btnPular) btnPular.addEventListener('click', sair);

    if (folio && !reduzirMovimento()) {
      /* Etapa 1 — a abertura roda sozinha. Clicar no fólio
         (ou teclar) adianta para a tela de entrar. */
      folio.addEventListener('click', revelarEntrada);

      agendar(function () { folio.classList.add('is-abrindo'); }, T_CAPA);
      agendar(function () { folio.classList.add('is-virando'); }, T_GUARDA);
      agendar(function () { folio.classList.add('is-aberto'); }, T_LEGENDA);
      agendar(revelarEntrada, T_ENTRADA);
    } else {
      /* Sem abertura encenada: vai direto para a etapa 2 */
      if (folio) folio.hidden = true;
      revelarEntrada();
    }

    document.addEventListener('keydown', function (evento) {
      /* Durante a abertura, qualquer tecla de avanço pula o fólio */
      if (!pronta) {
        if (evento.key === 'Tab') {
          evento.preventDefault();
          revelarEntrada();
          if (btnEntrar) btnEntrar.focus({ preventScroll: true });
          return;
        }

        if (evento.key === 'Escape' || evento.key === 'Enter' || evento.key === ' ') {
          evento.preventDefault();
          revelarEntrada();
        }
        return;
      }

      /* Esc encerra a introdução */
      if (evento.key === 'Escape' && !saindo) {
        evento.preventDefault();
        sair();
        return;
      }

      /* Confinamento de foco: a entrada é modal, então o Tab não
         deve alcançar o conteúdo que está atrás dela. */
      if (evento.key === 'Tab' && !saindo) {
        var focaveis = [btnEntrar, btnPular].filter(function (elemento) {
          return elemento && !elemento.disabled;
        });
        if (!focaveis.length) return;

        var primeiro = focaveis[0];
        var ultimo = focaveis[focaveis.length - 1];
        var atual = document.activeElement;

        if (evento.shiftKey && (atual === primeiro || atual === entrada)) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && atual === ultimo) {
          evento.preventDefault();
          primeiro.focus();
        } else if (atual !== primeiro && atual !== ultimo) {
          evento.preventDefault();
          primeiro.focus();
        }
      }
    });

    /* Foco inicial no diálogo: o leitor de tela anuncia o nome da
       tela de entrada sem transformar o botão em "foco de teclado". */
    entrada.setAttribute('tabindex', '-1');
    window.setTimeout(function () {
      entrada.focus({ preventScroll: true });
    }, 1200);
  } else {
    /* Sem tela de entrada (fallback): garante a página visível */
    liberarPagina();
  }

  /* ------------------------------------------------------------
     2. PARALAXE 3D DOS RETRATOS
     A posição do ponteiro vira um par de variáveis CSS (-1 a 1)
     lidas pelo CSS. Atualização limitada a um quadro por vez.
     ------------------------------------------------------------ */
  var palco = document.querySelector('.palco');
  var quadroPendente = false;
  var alvoX = 0;
  var alvoY = 0;
  var ativo = true;

  function aplicarParalaxe() {
    quadroPendente = false;
    if (!palco) return;
    palco.style.setProperty('--px', alvoX.toFixed(3));
    palco.style.setProperty('--py', alvoY.toFixed(3));
  }

  function aoMoverPonteiro(evento) {
    if (!ativo) return;
    alvoX = (evento.clientX / window.innerWidth - 0.5) * 2;
    alvoY = (evento.clientY / window.innerHeight - 0.5) * 2;

    if (!quadroPendente) {
      quadroPendente = true;
      window.requestAnimationFrame(aplicarParalaxe);
    }
  }

  function pararParalaxe() {
    ativo = false;
    window.removeEventListener('pointermove', aoMoverPonteiro);
  }

  var temPonteiro = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (palco && !reduzirMovimento() && temPonteiro.matches) {
    window.addEventListener('pointermove', aoMoverPonteiro, { passive: true });
  }


  /* ------------------------------------------------------------
     4. NAVEGAÇÃO, CULTURA, GLOSSÁRIO E QUIZ
     ------------------------------------------------------------ */
  var linksMenu = Array.prototype.slice.call(document.querySelectorAll('.menu-principal__link'));
  var secoesNavegacao = linksMenu.map(function (link) { return document.querySelector(link.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var observadorSecoes = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        linksMenu.forEach(function (link) {
          var ativo = link.getAttribute('href') === '#' + entrada.target.id;
          link.classList.toggle('is-ativo', ativo);
          if (ativo) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
    secoesNavegacao.forEach(function (secao) { observadorSecoes.observe(secao); });
  }

  var botoesFiltro = document.querySelectorAll('[data-person-filter]');
  botoesFiltro.forEach(function (botao) {
    botao.addEventListener('click', function () {
      var filtro = botao.getAttribute('data-person-filter');
      botoesFiltro.forEach(function (item) { var ativo = item === botao; item.classList.toggle('is-selecionado', ativo); item.setAttribute('aria-pressed', String(ativo)); });
      document.querySelectorAll('.cartao-personagem').forEach(function (cartao) { cartao.hidden = filtro !== 'todas' && cartao.getAttribute('data-grupo') !== filtro; });
    });
  });

  var conteudosCultura = {
    oralidade: { titulo: 'Oralidade e literatura', texto: 'Em diferentes sociedades africanas e comunidades afro-brasileiras, a transmissão oral preserva memórias, narrativas, conhecimentos e línguas. A literatura escrita também registra experiências, denuncia desigualdades e cria mundos possíveis — de Maria Firmina dos Reis a autores contemporâneos.', fonte: 'Para pesquisar: Fundação Cultural Palmares; Biblioteca Nacional; acervos literários e pesquisas acadêmicas.' },
    ciencia: { titulo: 'Ciência e tecnologia', texto: 'Povos africanos e afrodescendentes contribuíram historicamente para diferentes campos do conhecimento. No Brasil, pesquisadores e profissionais negros atuam hoje em áreas como saúde, engenharia, educação e tecnologia. Conhecimentos devem ser reconhecidos com autoria, contexto e evidências.', fonte: 'Para pesquisar: CNPq — ações de diversidade; universidades públicas e repositórios científicos.' },
    territorio: { titulo: 'Território e natureza', texto: 'Povos indígenas mantêm conhecimentos diversos sobre territórios, ciclos naturais, plantas, águas e biodiversidade. Esses saberes são produzidos em contextos específicos e estão ligados à continuidade dos povos, aos direitos territoriais e ao cuidado com a vida.', fonte: 'Para pesquisar: Instituto Socioambiental — Povos Indígenas no Brasil; FUNAI.' },
    artes: { titulo: 'Artes e expressões', texto: 'Música, dança, artes visuais, festas e outras expressões afro-brasileiras e indígenas são formas de criação, memória, afirmação e transformação. Cada manifestação tem história própria e deve ser compreendida a partir das comunidades que a mantêm e reinventam.', fonte: 'Para pesquisar: IPHAN — patrimônio cultural; Museu Afro Brasil; instituições culturais indígenas.' }
  };
  var painelCultura = document.getElementById('painel-cultura');
  document.querySelectorAll('[data-cultura]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var item = conteudosCultura[botao.getAttribute('data-cultura')];
      if (!item || !painelCultura) return;
      document.querySelectorAll('[data-cultura]').forEach(function (aba) { var ativo = aba === botao; aba.classList.toggle('is-ativa', ativo); aba.setAttribute('aria-selected', String(ativo)); });
      painelCultura.innerHTML = '<p class="painel-cultura__selo">CAMPO DE CONHECIMENTO</p><h3></h3><p class="painel-cultura__texto"></p><p class="fonte"></p>';
      painelCultura.querySelector('h3').textContent = item.titulo;
      painelCultura.querySelector('.painel-cultura__texto').textContent = item.texto;
      painelCultura.querySelector('.fonte').textContent = item.fonte;
    });
  });

  var buscaGlossario = document.getElementById('busca-glossario');
  var limparBusca = document.getElementById('limpar-busca');
  var verbetes = Array.prototype.slice.call(document.querySelectorAll('.verbete'));
  var resultadoBusca = document.getElementById('resultado-busca');
  var semResultados = document.getElementById('sem-resultados');
  function filtrarGlossario() {
    var termo = (buscaGlossario ? buscaGlossario.value : '').trim().toLocaleLowerCase('pt-BR');
    var encontrados = 0;
    verbetes.forEach(function (verbete) {
      var corresponde = !termo || verbete.textContent.toLocaleLowerCase('pt-BR').indexOf(termo) !== -1;
      verbete.hidden = !corresponde;
      if (corresponde) encontrados++;
    });
    if (resultadoBusca) resultadoBusca.textContent = encontrados + (encontrados === 1 ? ' conceito encontrado' : ' conceitos encontrados');
    if (semResultados) semResultados.hidden = encontrados !== 0;
  }
  if (buscaGlossario) buscaGlossario.addEventListener('input', filtrarGlossario);
  if (limparBusca) limparBusca.addEventListener('click', function () { buscaGlossario.value = ''; filtrarGlossario(); buscaGlossario.focus(); });

  var perguntasQuiz = [
    { categoria: 'HISTÓRIA E LITERATURA', pergunta: 'Qual escritora publicou o romance Úrsula em 1859?', opcoes: ['Carolina Maria de Jesus', 'Maria Firmina dos Reis', 'Lélia Gonzalez', 'Conceição Evaristo'], correta: 1, explicacao: 'Maria Firmina dos Reis publicou Úrsula em 1859. A obra é reconhecida como marco da literatura abolicionista brasileira.' },
    { categoria: 'DIREITOS E CIDADANIA', pergunta: 'O que caracteriza o racismo estrutural?', opcoes: ['Apenas ofensas individuais', 'Um conflito isolado entre pessoas', 'Desigualdades reproduzidas por estruturas e instituições', 'Uma diferença cultural sem efeitos sociais'], correta: 2, explicacao: 'O racismo estrutural se manifesta no funcionamento de instituições, práticas e relações sociais, reproduzindo desigualdades raciais.' },
    { categoria: 'POVOS ORIGINÁRIOS', pergunta: 'Qual afirmação respeita a diversidade dos povos indígenas?', opcoes: ['Todos possuem a mesma língua', 'São povos diversos, com línguas e histórias próprias', 'Vivem todos da mesma maneira', 'Pertencem a uma única cultura'], correta: 1, explicacao: 'Existem muitos povos indígenas, com diferentes línguas, organizações, territórios, histórias e modos de vida.' },
    { categoria: 'PENSAMENTO', pergunta: 'Quem é Ailton Krenak?', opcoes: ['Escritor e liderança indígena do povo Krenak', 'Compositor do século XIX', 'Primeiro presidente da ABL', 'Cientista português'], correta: 0, explicacao: 'Ailton Krenak é escritor, pensador e liderança indígena. Sua produção aborda direitos dos povos originários e relações com a natureza.' },
    { categoria: 'EDUCAÇÃO ANTIRRACISTA', pergunta: 'Qual é uma atitude antirracista no ambiente escolar?', opcoes: ['Ignorar relatos de discriminação', 'Tratar culturas como se fossem todas iguais', 'Evitar estudar a história africana', 'Rever práticas excludentes e valorizar diferentes referências'], correta: 3, explicacao: 'Uma educação antirracista identifica e enfrenta discriminações, revisa práticas e amplia a presença de histórias e conhecimentos diversos.' }
  ];
  var quizIndice = 0, quizPontos = 0, quizRespondido = false;
  var quizPergunta = document.getElementById('quiz-pergunta'), quizCategoria = document.getElementById('quiz-categoria'), quizOpcoes = document.getElementById('quiz-opcoes'), quizFeedback = document.getElementById('quiz-feedback'), quizProximo = document.getElementById('quiz-proximo');
  var quizProgresso = document.getElementById('quiz-progresso'), quizPontosEl = document.getElementById('quiz-pontos'), quizBarra = document.getElementById('quiz-barra-progresso'), quizCaixa = document.getElementById('quiz-caixa');
  function renderizarPergunta() {
    var pergunta = perguntasQuiz[quizIndice]; quizRespondido = false;
    quizCategoria.textContent = pergunta.categoria; quizPergunta.textContent = pergunta.pergunta;
    quizProgresso.textContent = 'Pergunta ' + (quizIndice + 1) + ' de ' + perguntasQuiz.length;
    quizPontosEl.textContent = quizPontos + (quizPontos === 1 ? ' ponto' : ' pontos');
    quizBarra.style.width = ((quizIndice + 1) / perguntasQuiz.length * 100) + '%';
    quizOpcoes.innerHTML = '';
    pergunta.opcoes.forEach(function (opcao, indice) { var botao = document.createElement('button'); botao.type = 'button'; botao.className = 'quiz-opcao'; botao.textContent = opcao; botao.addEventListener('click', function () { responderQuiz(indice); }); quizOpcoes.appendChild(botao); });
    quizFeedback.hidden = true; quizFeedback.textContent = ''; quizProximo.disabled = true;
    quizProximo.textContent = quizIndice === perguntasQuiz.length - 1 ? 'Ver resultado →' : 'Próxima pergunta →';
  }
  function responderQuiz(escolha) {
    if (quizRespondido) return; quizRespondido = true;
    var pergunta = perguntasQuiz[quizIndice], acertou = escolha === pergunta.correta;
    if (acertou) quizPontos++;
    Array.prototype.forEach.call(quizOpcoes.children, function (botao, indice) { botao.disabled = true; if (indice === pergunta.correta) botao.classList.add('correta'); else if (indice === escolha) botao.classList.add('incorreta'); });
    quizFeedback.innerHTML = '<strong>' + (acertou ? 'Resposta correta!' : 'Vamos aprender com essa questão.') + '</strong> ' + pergunta.explicacao;
    quizFeedback.hidden = false; quizPontosEl.textContent = quizPontos + (quizPontos === 1 ? ' ponto' : ' pontos'); quizProximo.disabled = false;
  }
  function finalizarQuiz() {
    var percentual = Math.round(quizPontos / perguntasQuiz.length * 100);
    quizCaixa.innerHTML = '<div class="quiz-final"><p class="quiz-categoria">JORNADA CONCLUÍDA</p><h3>Seu resultado</h3><p class="quiz-final__nota">' + quizPontos + '/' + perguntasQuiz.length + '</p><p>Você acertou ' + percentual + '% das perguntas. Continue explorando o acervo e revisite os conceitos do glossário.</p><button class="botao-quiz" id="quiz-reiniciar" type="button">Refazer quiz ↻</button></div>';
    document.getElementById('quiz-reiniciar').addEventListener('click', function () { quizIndice = 0; quizPontos = 0; quizCaixa.innerHTML = '<div class="quiz-topo"><span id="quiz-progresso">Pergunta 1 de 5</span><span id="quiz-pontos">0 pontos</span></div><div class="quiz-barra"><span id="quiz-barra-progresso"></span></div><p class="quiz-categoria" id="quiz-categoria"></p><h3 class="quiz-pergunta" id="quiz-pergunta"></h3><div class="quiz-opcoes" id="quiz-opcoes"></div><div class="quiz-feedback" id="quiz-feedback" aria-live="polite" hidden></div><div class="quiz-acoes"><button class="botao-quiz" id="quiz-proximo" type="button" disabled></button></div>';
      quizPergunta = document.getElementById('quiz-pergunta'); quizCategoria = document.getElementById('quiz-categoria'); quizOpcoes = document.getElementById('quiz-opcoes'); quizFeedback = document.getElementById('quiz-feedback'); quizProximo = document.getElementById('quiz-proximo'); quizProgresso = document.getElementById('quiz-progresso'); quizPontosEl = document.getElementById('quiz-pontos'); quizBarra = document.getElementById('quiz-barra-progresso'); quizProximo.addEventListener('click', avancarQuiz); renderizarPergunta();
    });
  }
  function avancarQuiz() { if (!quizRespondido) return; if (quizIndice < perguntasQuiz.length - 1) { quizIndice++; renderizarPergunta(); } else finalizarQuiz(); }
  if (quizProximo) quizProximo.addEventListener('click', avancarQuiz);
  if (quizCaixa && quizPergunta) renderizarPergunta();

  /* ------------------------------------------------------------
     3. UTILIDADES
     ------------------------------------------------------------ */
  /* Reavalia a preferência de movimento caso ela mude com a
     página aberta (ex.: usuário altera a configuração do sistema). */
  if (typeof SEM_MOVIMENTO.addEventListener === 'function') {
    SEM_MOVIMENTO.addEventListener('change', function (evento) {
      if (evento.matches) pararParalaxe();
    });
  }
})();
