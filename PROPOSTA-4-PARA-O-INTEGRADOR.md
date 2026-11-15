# Proposta 4 para o Integrador

Do Projeto Conta Fácil · 15/11/2026 · app 1.9.5 · Kit Fácil 0.8.0 · Código 0.8

Correções do Kit, nascidas dos ajustes 8 a 11 pedidos pelo Bruno em 15/11/2026 ("o design da janela de feedback está horrível e
quebrando o padrão de design do app"). Os itens 1 e 2 não mudam artigo do Código; o item 3 pede uma frase nova no Art. 78.

## 1. Janela de Avaliação e feedback: classe repetida e desenho fora do padrão

**Erro do Kit.** Em `comum/kit-facil.css`, `.kf-escolha` tem dois donos: a opção do feedback (`escolhasHTML`, cartão com
ícone, título e apoio) e a pílula de escolher um valor (`ui.escolha`, com `aria-pressed`). A regra da pílula vem depois
e vence: as opções do feedback ficavam com borda de pílula, sem respiro em cima e embaixo, e com o apoio em negrito.

**O que o Conta Fácil faz desde a 1.9.1 (`estilo.css`).**

- as duas opções são linhas que abrem alguma coisa: ícone, título, apoio e seta à direita, separadas por uma linha
  (`.kf-escolhas > .kf-escolha`), iguais às linhas `.lin` do app;
- o pé que só tem "Fechar" não é desenhado (`.kf-dlg-pe:has(> .kf-sec[data-kf-fechar]:only-child)`): o X fecha;
- `textarea.kf-entrada` tem o desenho dos outros campos; `.kf-det` abre com a seta do app.

**O que mudar no Kit.**

- dar nome próprio à opção do feedback (por exemplo, `.kf-fb-op`) e desenhá-la como linha (Art. 71);
- tirar do JavaScript o "Fechar" do pé das janelas em que ele é o único botão (Art. 68, § 1º);
- `textarea.kf-entrada` igual aos outros campos; `.kf-det` com a seta do Kit no lugar do marcador do navegador;
- conferir se o CSS do Kit ainda repete blocos inteiros (na 0.7.0 havia regras duas e três vezes, como
  `#kf-saidas > .kf-ov` e `.kf-car-janela`) e limpar.

**Teste a levar ao Kit.** Na escolha do feedback: cada opção tem o título e o apoio inteiros dentro dela, apoio em peso
400 e nenhum botão no pé.

**Impacto.** Os quatro apps têm a mesma janela.

## 2. Guia: o alvo dentro de uma janela precisa estar à vista no conteúdo dela (Arts. 78 e 79)

**Erro do Kit.** Em `demo`, `mostrar(el)` só confere se o alvo cabe entre a barra de cima e a janela do guia. Numa janela,
o conteúdo rola por baixo do pé; o alvo pode estar "na tela" e escondido atrás do pé. O dedo vai então para cima de um
botão do pé (no Conta Fácil, "Salvar no histórico") e o clique sai no alvo escondido.

**O que o Conta Fácil faz desde a 1.9.3 (`casca.js`, `maos`).** Antes de `tocar`, `apontar` e `digitar`, traz o alvo para
a parte visível de `.kf-dlg-corpo` (`naJanela`).

**O que mudar no Kit.** Em `mostrar`, quando o alvo está numa janela, usar como limites o retângulo de `.kf-dlg-corpo`
(e não a tela) e rolar o conteúdo da janela.

## 3. Guia: a janela pode continuar aberta de um passo para o outro (Art. 78)

**Pedido do Bruno (ajuste 11).** "As etapas 17 a 21 devem ser revisadas para serem mais orgânicas e não ficar um abre e
fecha da comanda o tempo todo." Fechar a comanda, uma pessoa paga a conta de todos, pagar outro valor e marcar quem já
pagou acontecem todos na mesma janela.

**O que impede hoje.** Em `rodar()`, todo passo começa com `if (dialogoAberto()) limparTela()`: a janela é fechada entre
um passo e outro, e o passo seguinte precisa abri-la de novo.

**O que mudar no Kit.** Um passo pode dizer `continua: true`: o Kit não fecha a janela antes dele. Ao voltar um passo
(`restaurar`), a janela continua sendo fechada; por isso o passo do app sabe se pôr no lugar sozinho (abre a janela, se
estiver fechada, ou só anda até o cupom certo).

**O que mudar no Código.** Art. 78, frase nova: "Passos seguidos que acontecem na mesma janela não a fecham e reabrem: a
janela fica aberta de um passo para o outro."

**Enquanto isso, no Conta Fácil.** O Bruno escolheu juntar os passos (1.9.4): os quatro passos da janela de Fechar a
comanda viraram dois, e o guia passou de 36 para 34 passos. A janela ainda abre uma vez em cada um deles, uma vez no passo
da conta que mudou e uma vez para salvar; com `continua: true`, essas aberturas seguidas viram uma só.

## 4. Guia: destacar uma área e tela cheia do app (Arts. 78 e 79)

**O que faltava no Kit (ajustes do Bruno nas etapas 17, 18, 20 e 29).**

- `apontar` só abraça um elemento. Para destacar um bloco sem caixa própria (o PAGAMENTO do cupom: título e linhas) ou só
  o texto de uma linha, o Conta Fácil cria um elemento invisível do tamanho da área (`demoArea`, em `casca.js`).
- Numa tela cheia do app (a festa de "Conta fechada"), `mostrar` rola a página, que está parada: o botão ficava escondido
  atrás da janela do guia. O app rola a própria tela e, no guia, deixa livre o pé dela (`body.kf-com-guia .festa`).

**O que mudar no Kit.** `apontar` aceitar uma lista de elementos ou um `Range` e abraçar a união; `mostrar` rolar o
ancestral que rola (janela, tela cheia ou página) e contar a janela do guia como área ocupada.
