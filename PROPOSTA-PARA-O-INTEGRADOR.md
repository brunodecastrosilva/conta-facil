# Proposta para o Integrador: o Conta Fácil é a referência do Projeto Fácil

Origem: Projeto Conta Fácil, versão 1.6.1 · 14/11/2026 · Código em vigor: 0.5 (rascunho) · Kit Fácil 0.6.0

**Situação: aprovada inteira pelo Bruno no Integrador em 14/11/2026, com as três leituras do Claude. Entrou no Código
0.6 (rascunho). Falta só o Kit 0.7.0 receber as peças da seção 4 (Painel do Integrador). Este arquivo agora é histórico.**

## 1. A decisão

Decisão do Bruno, em 14/11/2026, no Projeto Conta Fácil:

> O Conta Fácil ainda não está finalizado, mas desde já eu defino que este será o novo padrão do Projeto Fácil. Nada do
> que está aqui deve ser tratado como exceção. O Conta Fácil deve ser a referência. Tudo o que foi decidido nesta
> conversa deve ser tratado como regra.

O Código só muda no Integrador (Arts. 7º a 9º). Este arquivo é a proposta do Art. 7º, § 1º: o que mudar, por quê e o
impacto. Os textos abaixo são redação do Claude do Projeto Conta Fácil a partir das decisões do Bruno; quem aprova a
redação final é o Bruno, no Integrador.

## 2. O que fazer no Integrador (Art. 8º)

1. Reescrever os artigos da seção 3 e subir a versão do Código.
2. Levar para o Kit Fácil as peças do Conta Fácil listadas na seção 4 e subir a versão do Kit.
3. Atualizar `comum/CODIGO.md`, `comum/ANEXOS.md` e a pasta `comum/` nos quatro repositórios, e a skill `codigo-projeto-facil`.
4. Registrar no Painel e marcar a propagação: Elétrica Fácil, Estudo Fácil e Guitarra Fácil passam a seguir o Conta Fácil.
5. Trocar as Regras do Conta Fácil nas instruções do Projeto pelo texto da seção 5.

## 3. Artigos do Código a reescrever

| Artigo (0.5) | Regra nova, como é no Conta Fácil | Impacto |
|---|---|---|
| Art. 13, §§ 1º a 3º, e Art. 57 (presente colorido na barra) | Na barra de cima, o presente é um ícone de traço, da mesma cor da nuvem e do balão. A janela do apoio tem um presente em 3D que gira com o dedo, o mesmo texto, o QR code e um só botão. | Kit: ícone e janela do apoio. Os três outros apps trocam o presente. |
| Art. 16, IX, e Arts. 68 e 72 (janelas, movimento e teclado) | Um mecanismo só cuida das janelas: nascer, acompanhar o teclado, mudar de altura e trocar. O movimento é feito só com `transform`, num relógio só, sem transições de CSS de posição ou altura. Nada salta, some ou volta no caminho. Com o teclado aberto, o campo em foco fica à vista. | Kit: trocar o deslize e o tratamento do teclado pelo módulo de janelas do Conta Fácil (`casca.js` e seção 17 de `estilo.css`). |
| Art. 22 (versão 0.x na fase de testes) | App pronto para a publicação oficial usa versão 1.x. | Os outros apps sobem para 1.0.0 quando chegarem ao padrão novo. |
| Art. 23, I (todos os testes antes de publicar) | Antes de publicar, rodam a verificação do padrão e só os testes da parte alterada. O guia inteiro só roda quando a mudança mexe no guia; a bateria completa, quando mexe nas contas. O relatório de cada versão diz o que foi pulado. | Vale para os quatro apps. |
| Art. 57 (ícones do Kit) | Ícones num traço só: grade de 24, traço de 2, pontas redondas. | Kit: redesenhar o conjunto de ícones. |
| Arts. 59 e 60 (navegação) | Barra de baixo colada ao pé da tela, baixa, com a ação principal do app no centro. "Mais" é uma tela, e os Ajustes ficam dentro dela (no computador, no pé do trilho). | Kit: navegação e verificação do padrão (hoje acusa duas falhas no Conta Fácil). |
| Art. 64, II (um só jeito de criar) | A criação nasce no Início e no botão do centro da barra. | Os outros apps ganham o botão do centro. |
| Art. 65 (componentes do Kit) | Carrossel de cartões, arrastar e soltar e seções em que uma linha abre por vez, com o título tocado sempre à vista. Todo trecho redesenhado anima (`comMovimento`). Segmento no lugar de guias quando são poucas opções. | Kit: incorporar essas peças. |
| Art. 66 (uma cor de botão principal) | Verde para a ação principal e âmbar para a ação que começa o trabalho (abrir, sortear), os dois com contraste AA. Vermelho para excluir. | Cada app define o seu par de cores. |
| Art. 67 (nada lado a lado) | Coleções para ver de relance (tiras, grades, pódios) podem ficar lado a lado. | Sem impacto obrigatório. |
| Art. 68 (janelas e avisos só do Kit) | Momentos de marca (abertura e festa de fechamento) podem ser telas cheias, com foco preso, Esc e leitor de tela tratados. | Sem impacto obrigatório. |
| Art. 72 (movimento só do Kit) | Tudo o que abre e recolhe tem movimento. Animações próprias são permitidas, sempre respeitando movimento reduzido. | Revisar os outros apps tela a tela. |
| Arts. 75 e 76 (sem tela de primeiro uso) | Abertura de quatro telas, uma vez só, com Pular. Quem diz o nome nela já recebe a primeira recompensa. | Os outros apps ganham a abertura. |
| Arts. 77 a 79 (guia em dois níveis) | Um guia só, do começo ao fim, numa janela fixa num espaço só dela, acima da barra de baixo. Cada passo executa a função de verdade, numa demonstração que não grava nada, e só mostra o que precisa. | Kit: trocar o guia. Os outros apps reescrevem os passos. |
| Art. 58 (barra de cima) | Nuvem, presente e balão na mesma cor, em traço. | Kit: barra de cima. |
| Anexo II (tokens) | Cantos maiores, navegação mais baixa e fonte de caráter nos títulos (no Conta Fácil, Bricolage Grotesque). | Kit: tokens. |
| Anexo VII (testes comuns) | `npm test` roda os testes do Kit e os do app; a varredura de acessibilidade procura os Ajustes onde eles estão agora. | Kit: testes da moldura. |

Artigos novos, de decisões que o Código 0.5 não tinha:

| Tema | Regra |
|---|---|
| Fluidez | O app é fluido em todas as telas: nenhum tranco, salto ou corte ao abrir janelas, teclado, linhas ou chaves. |
| Quem decide | O app não decide pela pessoa. Quando há mais de um caminho (quem entra no sorteio, quem cobre uma diferença), a escolha é dela. |
| Um lugar para cada coisa | Cada função fica num lugar só. Nada de botões, atalhos ou telas repetidas. |
| Interface | Mínima e autoexplicativa; o app prevê os casos que podem acontecer (valor a mais ou a menos, conta que muda depois de paga, pessoa que foi embora). |
| Kit e app | Quando o Kit atrapalha a qualidade de um app, o app passa por cima sem alterar `comum/`, e a solução vira proposta para o Kit. |
| Retrocompatibilidade | Enquanto só o Bruno usa os apps, não é preciso manter formatos antigos de dados. |

Três leituras do Claude que o Bruno precisa confirmar:

1. **Arts. 82, 84, 85 e 87 (perguntar antes de decidir desenho e texto).** No Conta Fácil o Claude decidiu sem perguntar, por pedido de liberdade criativa. Como regra da família, a proposta é: o Claude decide desenho e texto e relata o que decidiu; só pergunta quando a decisão custa dinheiro, não tem volta ou muda uma regra.
2. **Art. 24 (publicar direto na `main`).** A 1.0.0 passou por um ramo uma única vez. A proposta é não mudar o artigo: foi um caso isolado.
3. **Sem bebida alcoólica.** Fica só nas Regras do Conta Fácil, porque não se aplica aos outros apps.

## 4. Peças do Conta Fácil que viram Kit

Módulo de janelas e teclado, barra de baixo com botão no centro, tela "Mais", ícones de traço, presente em 3D, abertura
de quatro telas, guia de janela fixa, seções de uma linha aberta por vez, `comMovimento`, carrossel e arrastar e soltar.

## 5. Regras do Conta Fácil, texto novo

Para colar nas instruções do Projeto, no lugar dos Arts. 1º a 13 atuais.

**Art. 1º** O Conta Fácil serve para dividir a conta de bar e restaurante (a comanda). Ideia visual: comanda de papel.
O app não tem nenhuma referência a bebida alcoólica, em texto, exemplo ou imagem.

**Art. 2º** Repositório `brunodecastrosilva/conta-facil`, endereço `brunodecastrosilva.github.io/conta-facil/`. Toda
mudança é feita direto no repositório.

**Art. 3º** O contexto atual do app fica no arquivo `claude/contexto-conta-facil.md` deste Projeto, atualizado a cada
versão publicada.

**Art. 4º** "Comanda ao vivo" é o nome oficial da função de dividir a mesma comanda entre celulares.

§ 1º A comanda ao vivo encerrada é apagada do Firebase na hora; só o aparelho que a criou pode apagá-la.

§ 2º Para dividir de novo, compartilha-se outra vez, com código novo.

§ 3º A comanda aberta não sincroniza. "Pago" e "Já saiu da mesa" ficam só no aparelho de quem marcou.

**Art. 5º** O consumo tem duas categorias: compartilhado (partes iguais, entre todos ou entre alguns) e individual (por
unidade, distribuído na janela de lançar).

**Parágrafo único.** Tudo se lança numa janela só. O item novo entra no fim da lista. Quem já saiu da mesa não entra em
item novo.

**Art. 6º** A comanda é uma folha só: pessoas, pedidos e total. Tocar num nome mostra os atalhos (serviço, couvert,
Juntar, Ver cupom e Editar). Editar só muda o nome ou tira da mesa. Arrastar um nome sobre outro junta os dois no mesmo cupom.

**Art. 7º** Na conta da mesa, serviço, couvert e desconto valem em R$ ou em %, e há cortesias:

I – couvert, desconto e cortesia usam chave liga e desliga;

II – o desconto não pede justificativa e pode ser "No valor total da comanda" ou "Apenas no valor do consumo"; em %,
mantém a máscara atual;

III – desligar o serviço de alguém pergunta quem fica com essa parte: "Ninguém paga essa parte" ou "Os outros dividem
essa parte".

**Art. 8º** Fechar a comanda é uma janela da própria comanda, com um cupom por pessoa (a mesa primeiro). O pagamento
mora nela:

I – marcar quem já pagou, só depois de fechar;

II – pagar outro valor, a mais ou a menos, com a escolha de quem fica com a diferença: "Os outros dividem" ou uma pessoa;

III – "Uma pessoa paga a conta de todos", sem juntar cupons: cada um continua com o seu;

IV – "Já saiu da mesa", que trava o cupom de quem pagou;

V – se a conta mudar depois de paga, o app mostra quanto falta ou quanto devolver, e outra pessoa pode ficar com a diferença;

VI – tudo o que fica embaixo do cupom tem a mesma largura; com o teclado aberto, Voltar e Salvar se recolhem.

**Art. 9º** "Excluir comanda" fica logo abaixo de "Fechar comanda", com a mesma largura e em vermelho.

**Art. 10.** O cupom é a cereja do bolo: desenho uniforme de comanda real, textos pretos, sem quadros que quebrem o
visual, com a fonte IBM Plex Mono.

**Art. 11.** A barra de baixo tem Início, Histórico, Comanda (no centro), Tampinhas (ou Cadastros, com as tampinhas
desligadas) e Mais. Os Ajustes ficam dentro de Mais.

**Art. 12.** Nos Ajustes, a guia própria é "Tampinhas e apresentação"; em Conta e perfil fica "Você nas comandas", onde
a pessoa escreve o próprio nome.

**Art. 13.** O guia é um só, com 36 passos na ordem de uso. Cada passo executa a função numa demonstração que não grava nada.

**Art. 14.** No sorteio, quem entra é escolha de quem sorteia: a mesa vem marcada, e dá para tirar e pôr nomes.

**Art. 15.** Tampinhas e níveis crescem com o uso e podem ser desligados. Quem diz o nome na apresentação recebe ali a
primeira tampinha.

**Art. 16.** Antes de publicar, rodam a verificação do padrão e só os testes da parte alterada. O guia inteiro só roda
quando a mudança mexe no guia; a bateria completa, quando mexe nas contas. O relatório diz o que foi pulado.
