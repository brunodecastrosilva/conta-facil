# Proposta 3 para o Integrador

Do Projeto Conta Fácil · 15/11/2026 · app 1.8.7 · Kit Fácil 0.7.0 · Código 0.7

Três correções, uma peça nova e uma regra nova do Kit, nascidas de seis ajustes pedidos pelo Bruno em 15/11/2026. A primeira só faz o Kit cumprir o que o
Código já diz; a segunda também alarga dois artigos do Código; a terceira pede um parágrafo novo; a quarta é só do Kit; a quinta pede uma frase nova no Código.

## 1. A cópia da janela que fecha não pode ser religada (Arts. 68, § 3º, e 72-A)

**O que acontece.** Ao fechar uma janela que tem lista de escolha, data ou hora, ela dá um pulo para cima antes de descer.
`fantasma()` copia a janela e tira os atributos `data-`, inclusive `data-kf-esc`, `data-kf-data` e `data-kf-hora`. Os
observadores de `escolhaLigar`, `dataLigar` e `horaLigar` veem na cópia um campo "sem ligar" e montam outra lista depois
dele. A cópia fica uma linha mais alta, e o topo sobe.

**O que mudar em `comum/kit-facil.js`.** Uma das duas, ou as duas:

- `fantasma()` mantém `data-kf-esc`, `data-kf-data`, `data-kf-hora` e `data-kf-nativa`;
- `escolhaLigar`, `dataLigar` e `horaLigar` pulam o que está dentro de `#kf-saidas`.

**Teste a levar ao Kit.** Fechar uma janela com `<select>`: a cópia em `#kf-saidas` tem a mesma altura da janela e uma só
`.kf-esc` por campo.

**Enquanto isso, no Conta Fácil.** `comanda.css` não desenha a lista repetida (`#kf-saidas [hidden] + .kf-esc + .kf-esc`).
Quando o Kit for corrigido, essa regra sai.

**Impacto.** Todos os apps com janela que tenha lista de escolha, data ou hora têm o mesmo pulo.

## 2. Caixa de texto nunca é selecionada sozinha (Arts. 16, IX, e 68, § 5º)

**Regra do Bruno (15/11/2026).** "Uma caixa de texto NUNCA deve ser selecionada automaticamente." O Código diz hoje que
nenhuma janela *abre* com a caixa selecionada; a regra do Bruno é mais larga e vale para qualquer momento.

**O que mudar no Código.** Art. 68, § 5º: trocar "Nenhuma janela abre com a caixa de texto selecionada" por "Nenhuma
caixa de texto é selecionada sozinha, em janela ou fora dela: quem seleciona é o toque da pessoa. O aplicativo só devolve
o foco ao campo em que ela já estava digitando. Campo que falta preencher é apontado (contorno e `aria-invalid`), sem
receber o foco". Ajustar o Art. 16, IX, na mesma linha.

**O que mudar em `comum/kit-facil.js`.** Em Avaliação e feedback, "Relatar um problema" sem descrição dá foco ao campo
da mensagem (`(problema ? msg : …).focus()`): apontar o campo em vez de selecionar. Levar ao Kit o `apontar()` do Conta
Fácil (`app.js`) e o contorno de `[aria-invalid="true"]` (`estilo.css`).

**Impacto.** Nos outros apps, a revisão de cada um (Art. 93, § 2º) tira os focos automáticos em campos.

## 3. Puxar a janela para baixo (Arts. 16, X, 68, § 3º, e 72-A)

**O que acontecia.** A barrinha no alto da janela era só desenho. No iPhone, arrastar por ela rolava a página por trás (a
janela subia e cortava o conteúdo) e tocar e segurar selecionava o título.

**O que o Conta Fácil faz desde a 1.8.3 (`casca.js` e `estilo.css`).** Puxar pelo cabeçalho leva a janela com o dedo, pela
propriedade `translate`, que soma com o `transform` do mecanismo de janelas. Soltar depois de um terço da altura (no
máximo 160 px) ou num puxão rápido fecha, como o X; antes disso, a janela volta. A cópia de saída herda o `translate` e
desce de onde o dedo deixou. Cabeçalho e rodapé têm `touch-action:none` e não selecionam texto. Vale abaixo de 1024 px,
enquanto a barrinha aparece; fora do guia.

Desde a 1.8.4, por regra do Bruno, **a janela só se move pela barrinha**: arrastar em qualquer outro ponto dela não faz
nada, e só rola o conteúdo que for maior que a janela, parando no começo e no fim sem puxar a página (`touchmove` em
`casca.js`).

**O que mudar no Kit.** Levar o gesto para dentro de `janelas` em `comum/kit-facil.js` e a barrinha e as regras de toque
para `comum/kit-facil.css`.

**O que mudar no Código.** Art. 68, parágrafo novo: "No celular e no tablet, a janela tem uma barrinha no alto e pode
ser puxada para baixo pelo cabeçalho: acompanha o dedo e fecha, ou volta ao lugar. Fora da barrinha, o dedo não move a
janela; só rola o conteúdo que for maior que ela. O X e o Esc continuam (Art. 16, X)."

**Impacto.** Todos os apps ganham o gesto quando receberem o Kit.

## 4. O cursor do campo só aparece com a janela parada (Arts. 68, § 3º, e 72-A)

**O que acontecia.** No iPhone, o cursor do campo é desenhado pelo sistema e não acompanha uma janela que se move por
`transform`. Ao tocar num campo, a janela sobe com o teclado e o cursor ficava para trás, fora da caixa, até ela parar.

**O que o Conta Fácil faz desde a 1.8.5 (`casca.js` e `estilo.css`).** Enquanto a janela do campo em foco está a caminho
(o teclado vai subir, a janela está subindo com ele ou há animação em quem contém o campo), o campo recebe
`caret-color:transparent`; com a janela parada, o cursor volta.

**O que mudar no Kit.** Levar isso para dentro de `janelas` em `comum/kit-facil.js`, que já sabe quando a janela está a
caminho (`_kfTk`, `partir`), sem precisar olhar quadro a quadro.

**Impacto.** Todos os apps com campo em janela têm o mesmo cursor atrasado no iPhone.

## 5. Nenhum botão sobe para cima do teclado (Arts. 16, IX, e 68, § 3º)

**Regra do Bruno (15/11/2026).** "Ao abrir o teclado, eu não quero que nenhum botão suba para cima do teclado. Isso não
deve acontecer nunca."

**O que o Conta Fácil faz desde a 1.8.6 (`estilo.css`).** Com o teclado aberto (`html.kf-tk`), o pé de toda janela
(`.kf-dlg-pe`) se recolhe; volta quando o teclado fecha. Fora do guia. Antes valia só para Fechar a comanda (Regras do
Conta Fácil, Art. 8º, VI). O mecanismo de janelas do Kit já anima o pé que some e volta.

**O que mudar no Kit.** Levar a regra para `comum/kit-facil.css`.

**O que mudar no Código.** Art. 68, § 3º, frase nova: "Com o teclado aberto, o pé da janela se recolhe: nenhum botão
sobe para cima do teclado."

**Decisão do Bruno sobre o item 3.** O gesto de puxar a janela não ganha passo no guia.

## 6. Todo botão de exclusão é vermelho, com um vermelho só (Arts. 16, V, e 66, § 1º)

**Regra do Bruno (15/11/2026).** "Eu quero que todos os botões do app referentes a exclusão sejam vermelhos."

**O que o Conta Fácil faz desde a 1.8.7 (`estilo.css`, `app.js`).** Excluir, remover e apagar são botões cheios, vermelhos,
com texto branco; a confirmação que exclui também (`confirmSheet` marca perigo pelo rótulo); botão só com ícone fica com
o ícone vermelho. O vermelho do botão é um só no claro e no escuro (`--cf-excluir: #B3362B`, 5,9:1 com branco).

**Erro do Kit corrigido por cima.** No escuro, `.kf-btn.kf-perigo` usa `--kf-bad` (#F08E80) com texto branco: contraste
perto de 2,5:1, abaixo do AA (Art. 16, V). E "Restaurar padrões de fábrica" é contornado (`kf-perigo-sec`).

**O que mudar no Kit.** Uma cor própria para o fundo do botão de perigo (`--kf-perigo-fundo: #B3362B` nos três temas);
`kf-perigo-sec` passa a ser cheio como `kf-perigo`; `confirmar()` marca perigo quando o rótulo exclui.

**O que mudar no Código.** Art. 66, § 1º: "Vermelho é só para excluir, e todo botão que exclui, remove ou apaga é
vermelho e cheio, inclusive o da confirmação; botão só com ícone tem o ícone vermelho."
