# Proposta 4 para o Integrador

Do Projeto Conta Fácil · 15/11/2026 · app 1.9.1 · Kit Fácil 0.8.0 · Código 0.8

Uma correção do Kit, nascida do ajuste 8 pedido pelo Bruno em 15/11/2026 ("o design da janela de feedback está horrível e
quebrando o padrão de design do app"). Não muda artigo do Código: faz o Kit cumprir os Arts. 15, II, 68, § 1º, e 71.

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
