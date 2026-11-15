# Proposta 3 para o Integrador

Do Projeto Conta Fácil · 15/11/2026 · app 1.8.2 · Kit Fácil 0.7.0 · Código 0.7

Duas correções do Kit, nascidas de dois ajustes pedidos pelo Bruno em 15/11/2026. A primeira só faz o Kit cumprir o que o
Código já diz; a segunda também alarga dois artigos do Código.

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
