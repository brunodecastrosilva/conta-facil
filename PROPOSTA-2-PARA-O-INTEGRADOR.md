# Proposta 2 para o Integrador: um relógio só (600 ms) e o que ainda é do app e deve ir para o Kit

Origem: Projeto Conta Fácil, versão 1.7.0 · 15/11/2026 · Código em vigor: 0.6 (rascunho) · Kit Fácil 0.6.0

**Situação: aprovada inteira pelo Bruno no Integrador em 15/11/2026.** Entrou no Código 0.7 (Arts. 16, IX; 65, XII e
XIII; 68, §§ 1º, 3º e 5º; 72, §§ 1º e 2º; 77) e nos Anexos II, V e VII. Falta o Kit 0.7.0 receber as peças (Painel do
Integrador, D13). Este arquivo agora é histórico.

## 1. As decisões do Bruno (15/11/2026)

> Eu quero uma regra que TODAS as aberturas e fechamentos devem durar 600 ms. […] O Conta Fácil é o novo padrão, então
> todo o seu comportamento deve ir para o Kit. […] NENHUMA janela deve abrir com a caixa de texto selecionada. […]
> Parece que cada janela tem um código próprio, quando isso deveria ser uniformizado em todas as janelas do app.

O Kit só muda no Integrador (Art. 30). No Conta Fácil 1.7.0 as regras já valem, com o app passando por cima do Kit sem
alterar `comum/` (Art. 30-A). Esta proposta diz o que levar para o Código e para o Kit 0.7.0.

## 2. Artigos do Código a mudar

| Artigo (0.6) | Texto proposto | Impacto |
|---|---|---|
| Art. 72 (movimento) e Anexo V | **Um relógio só.** Tudo o que o aplicativo abre ou fecha dura 600 ms, na mesma curva (`cubic-bezier(.45,0,.2,1)`): janelas (nascer, sair, trocar e mudar de altura), o fundo escuro, seções e trechos que abrem e recolhem, troca de tela e de guia, avisos, menus, listas e calendário. Nenhum arquivo escreve outra duração de abrir ou fechar: usa a do Kit. Ficam de fora o que não abre nem fecha (toque no botão, chaves, arrastar, destaques) e a janela que acompanha o teclado do sistema, que segue o relógio do teclado (cerca de 300 ms). | Kit: `MOV.ms`, `MOV.curto` e `MOV_SAIDA` passam a 600 ms; as cópias que saem (janelas, listas, calendário) só são removidas no fim do movimento; o CSS do Kit usa as variáveis `--kf-ms` e `--kf-curva`. Os quatro apps trocam durações soltas por elas. |
| Art. 68, § 3º (janelas) | Acrescentar: a janela que fecha desce pelo pé da tela, no mesmo relógio e na mesma curva de quando nasceu; o fundo clareia junto. O comportamento é um só para todas as janelas, as do Kit e as do aplicativo. | Kit: a saída entra no módulo de janelas (hoje o Kit some com a janela em 200 ms). |
| Art. 16, IX, e Art. 68 (foco) | **Nenhuma janela abre com a caixa de texto selecionada.** Ao abrir, o foco vai para a janela (ou para um botão marcado); o teclado só sobe quando a pessoa toca no campo. Vale no celular e no computador. | Kit: `dialogo.abrir` ignora `autofocus` em campo de texto. Rever as janelas dos outros apps. |
| Art. 68, § 1º (botões da janela) | Janela que só precisa ser fechada não tem botão "Pronto" nem "Fechar" no pé: o X fecha. O pé fica para ações (Salvar, Adicionar, Fechar comanda). | Rever as janelas dos quatro apps. |
| Art. 65 (componentes) | Campo com sugestões: a lista abre abaixo do campo; quando o campo divide a linha com um botão, abre abaixo da linha inteira, e o botão continua alinhado ao campo e com a mesma altura. | Kit: novo componente (seção 3). |
| Arts. 77 a 79 (guia) | O guia segue a ordem de uso do aplicativo: mostra cada função no ponto em que a pessoa a usaria (no Conta Fácil, serviço, couvert e desconto vêm antes de Fechar a comanda). | Os outros apps escrevem o guia nessa ordem. |

## 3. O que ainda é próprio do Conta Fácil e deve ir para o Kit

Além das peças já listadas no Anexo II ("Peças a levar ao Kit"):

| Peça | Onde está no Conta Fácil 1.7.0 | Como entra no Kit |
|---|---|---|
| Relógio único | `app.js` (`MOVE`, `MV`), `estilo.css` (`--cf-ms`, `--cf-curva`, seção 18) | vira `KitFacil.movimento.ms` = 600 e `--kf-ms`; some o ajuste provisório que o app faz nas chamadas do Kit (`Element.prototype.animate`, em `app.js`) |
| Saída das janelas | `casca.js`, bloco "janelas", parte 4 (`sair`, `#cf-saidas`) | entra no módulo de janelas; o Kit deixa de usar `sairDialogo` |
| Janela sem campo selecionado | `app.js` (`openSheet`) | regra do `dialogo.abrir` |
| Campo com sugestões | `app.js` (`attachSuggest`), `comanda.css` (`.sg-*`) | `KitFacil.sugestoes(campo, itens, aoEscolher)` |
| Campo de dinheiro e de porcentagem | `app.js` (`maskMoney`, `maskPct`, `prepFields`) | `KitFacil.campo.dinheiro` e `KitFacil.campo.porcento` |
| Passo a passo de quantidade (− e +) | `app.js` (`.stepper`), `comanda.css` | componente do Kit |
| Chave liga e desliga e botões de escolha | `comanda.css` (`.switch`) e `estilo.css` (`.chip-b`) | componentes do Kit |
| Confirmação | `app.js` (`confirmSheet`) repete `KitFacil.dialogo.confirmar` | o app passa a usar a do Kit quando ela tiver os botões no desenho novo |
| Aviso rápido | `app.js` (`toast`) só repassa para `KitFacil.avisar` | o app chama o Kit direto |
| Pix copia e cola e QR code de cobrança | `app.js` | `KitFacil.pix`, junto com o do apoio |
| Tampinhas, níveis e festa de fechamento | `jogo.js` | peça opcional do Kit (`KitFacil.jogo`), para os apps que quiserem recompensas |
| Medição de movimento quadro a quadro | `tests/app.test.mjs` (janelas, teclado, 600 ms) | testes comuns do Kit (Anexo VII) |

Ficam só no Conta Fácil, por serem do assunto dele: contas da comanda, cupons, comanda ao vivo e sorteio.

## 4. O que o app ainda não consegue acertar sem o Kit

- Menus, listas e calendário do Kit **fecham** em 200 ms: a cópia que sai é removida por um relógio interno do Kit.
- As janelas do próprio Kit (sincronização, avaliação, apoio) já nascem e saem em 600 ms, porque passam pelo módulo de
  janelas do app; o conteúdo interno delas segue o Kit.
