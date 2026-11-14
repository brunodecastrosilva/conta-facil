# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`; enquanto a versão começar
com `0.`, o app está em fase de testes (rascunho).

## 1.5.0 · 2026-11-14

- **Janelas num movimento só:** no iPhone, a janela nascia embaixo, saltava para cima do teclado num quadro, passava do ponto e voltava. Havia três coisas mexendo nela ao mesmo tempo, todas do Kit: a entrada (sobe 28 px), o reposicionamento quando o teclado abre e um deslize a cada mudança de altura. Agora o app cuida sozinho da posição da janela, numa conta só (pé da tela, menos o guia, menos o teclado), e toda mudança é uma transição: a janela nasce abaixo da tela e sobe; se o teclado abre no meio do caminho, ela continua até o novo lugar, sem saltar nem voltar. Fechar o teclado desce a janela do mesmo jeito.
- **Uma janela no lugar de outra:** a tela não escurece de novo e a janela nova parte da altura da anterior.
- **Teclado numérico:** a barra própria de OK foi retirada. Ela repetia a tecla de concluir que o teclado do aparelho já mostra, e obrigava a janela a mudar de tamanho mais uma vez.
- **Limpeza:** as regras de janela, teclado e guia, que estavam espalhadas em seis trechos, viraram uma seção só no estilo e um módulo só no código; saíram funções, variáveis e estilos que sobraram de telas retiradas (Detalhes antigo, "paga tudo" antigo, limpar comanda).

## 1.4.0 · 2026-11-14

- **Uma pessoa paga a conta de todos:** saiu da Conta da mesa e foi para **Fechar a comanda**, embaixo do cupom da mesa. Não junta mais ninguém: cada pessoa continua com o seu cupom, que passa a dizer "Paga para Fulano"; o cupom da mesa lista quem paga a conta e quanto cada um deve. "Cada um paga o seu" desfaz.
- **Pagar outro valor:** foi para **Fechar a comanda**, embaixo do cupom de cada pessoa (campo "Vai pagar" e "Valor da conta" para voltar). O cupom mostra quanto ela paga ao local e os acertos com os outros.
- **Editar (antes Detalhes):** a janela da pessoa agora só muda o nome ou tira a pessoa da mesa. O consumo se ajusta no pedido; serviço e couvert, nos atalhos da pessoa; pagamento, em Fechar a comanda. No cupom compartilhado, a janela mostra quem paga, com uma chave por pessoa, e o lápis para editar cada uma. "Juntar com" e "Pagar outro valor" saíram dali.
- **Cupom compartilhado:** "Paga couvert" ganhou a mesma lista por pessoa que "Paga serviço" já tinha.
- **Excluir comanda:** saiu da Conta da mesa e fica logo abaixo de Fechar comanda. As opções "Limpar os itens" e "Recomeçar do zero" foram retiradas.
- **Chaves de serviço, couvert e desconto:** ao ligar ou desligar, a janela ia e voltava várias vezes (o app animava a altura e o Kit somava um deslize a cada quadro). Agora é um movimento só, e a chave tocada desliza até o lugar. O mesmo vale para os cupons de Fechar a comanda.
- **Teclado no iPhone:** ao tocar num campo dentro de uma janela, o Safari empurrava a tela inteira para cima, a janela saía pelo alto e voltava. O app agora dá o foco de um jeito que o Safari não mexe na tela, e traz o campo à vista dentro da janela depois que o teclado sobe.
- **Aviso com o teclado numérico:** o aviso de pé de tela podia esticar e cobrir a janela inteira; corrigido.
- **Guia:** a lista de "Juntar" não nasce mais com o primeiro nome destacado; passo novo com o atalho de **segurar um nome e arrastar sobre outro**; passos novos para pagar a conta de todos e pagar outro valor, em Fechar; "Mude o nome ou tire da mesa" no lugar de Detalhes; o guia não toca mais na barra de baixo quando a tela pedida já está aberta; o passo do presente mostra o QR code e o botão de copiar o código Pix, sem girar o objeto. São 36 passos.

## 1.3.3 · 2026-11-14

- **Marcar como pago só depois de fechar:** o botão saiu da comanda aberta e do "Ver cupom". Agora fica em **Fechar a comanda**, embaixo do cupom de cada pessoa; ao tocar, o cupom ganha o carimbo PAGO ali mesmo, sem fechar a janela, e o Desfazer do aviso também atualiza o cupom. Quem já está marcado continua podendo ser acertado (falta ou troco) ou desmarcado pela comanda.
- **Guia:** os passos seguem a nova ordem (Feche a comanda → Marque quem já pagou → Serviço, couvert e desconto → A conta de quem já pagou mudou → Salve no Histórico).
- **Guia, pessoas na mesa:** a janela saltava a cada nome no iPhone. A causa era a área segura do pé da tela, que entrava e saía da janela cada vez que o campo ganhava ou perdia o foco. No guia a janela agora fica parada, e a barra do OK do teclado numérico não aparece.
- **Teclado aberto:** a janela continua, na mesma cor, por trás do teclado e da barra de preenchimento (o teclado do iPhone é translúcido e mostrava uma faixa da comanda). Os espaços da janela apertam para Produto, Quantidade, Valor e Tipo de consumo caberem acima do teclado, e o rodapé ganha uma sombra quando há conteúdo rolando por baixo.
- **Teclado numérico:** com a barra do OK, o título da janela podia subir para fora da tela em janelas altas. A janela agora desconta a altura da barra, e a barra tem a cor da janela.
- **Campos:** os campos pedem ao iPhone para não oferecer preenchimento automático (o aviso "Preencher Automaticamente" não faz sentido em nome de produto). Depende do iOS respeitar o pedido.
- **Início:** a próxima tampinha ficou centrada com o texto e alinhada com a bolacha do nível.
- **Comanda:** os botões Juntar, Ver cupom e Detalhes não encostam mais na borda.

## 1.3.2 · 2026-11-14

- **Início:** "Ver o guia" passou a vir antes de "Ver uma comanda de exemplo".

## 1.3.1 · 2026-11-14

- **Presente:** as duas pontas da fita atravessavam a tampa na diagonal. O laço foi refeito: quatro alças em roseta e as pontas deitadas sobre a tampa, com corte em V, sem passar da beirada.
- **Giro automático:** a tampinha e o presente voltam a girar sozinhos, devagar e no mesmo sentido, cerca de um segundo depois que a pessoa para de mexer.
- **Ícone de Tampinhas:** tampinha vista de cima, com a mesma silhueta das tampinhas da coleção.
- **Apresentação, terceira tela:** figura de QR code com os três cantos e módulos; o carimbo PAGO não cobre mais o valor; as linhas tracejadas do papel passaram a ser desenhadas como fundo e não mudam mais quando a animação termina (vale para os outros papéis do app).

## 1.3.0 · 2026-11-14

Terceira rodada de ajustes pedidos pelo Bruno, mais uma rodada de testes com o guia inteiro gravado em vídeo.

- **Guia que faz, não só aponta:** 34 passos, cada um executando a função na demonstração: alterar um pedido, somar unidade e marcar cortesia, tirar o serviço de alguém, ver o cupom e os detalhes, juntar e separar, "uma pessoa paga a conta de todos", marcar pago, ligar couvert e desconto, acertar a diferença de quem já pagou, fechar e salvar, girar a tampinha, repetir e excluir uma comanda, salvar chave Pix, criar turma, sortear, abrir os Ajustes, a nuvem, o balão e o presente. A comanda ao vivo é a única que só é mostrada (ligá-la gravaria no servidor).
- **Guia, lista de quem dividiu:** ao lançar, a lista sobe para o alto da janela, e todos os nomes ficam à vista.
- **Guia, voltar:** todo passo começa de tela limpa, então voltar refaz o passo inteiro, em qualquer ponto.
- **Guia, destaque:** virou um anel solto, por cima de tudo; não é mais cortado pela caixa em que o botão está.
- **Tampinhas e presente em 3D de verdade (WebGL):** malha lisa com ombro e 21 gomos, esmalte com brilho, avesso de metal com reflexo e forro; caixa de cantos boleados, papel de bolinhas, fita acetinada e laço. Sem WebGL, vale o desenho anterior.
- **Fechar a comanda:** as setas e o contador de cupons formam uma barra só, com botões redondos.
- **Por dentro:** saiu a conversão de dados da 1.0 (só o Bruno usa o app).

## 1.2.0 · 2026-11-14

Segunda rodada de ajustes pedidos pelo Bruno depois de usar o app no iPhone.

- **Quem já pagou:** marcar como pago guarda o valor pago. Se a conta da pessoa mudar depois (desconto, serviço, couvert, item novo, alguém que entrou num item "entre todos", pessoa removida), o app mostra a diferença em vez de seguir como se estivesse tudo certo: "falta R$ x" ou "devolver R$ x", na linha da pessoa, no alto da comanda, no cupom da mesa e num aviso com o botão "Recebi" ou "Devolvi". A conta da mesa avisa na hora o que cada mudança faz com quem já pagou. Salvar com diferença pede confirmação.
- **Item novo com gente que já pagou:** essas pessoas ficam de fora da divisão por padrão, com a etiqueta "já pagou"; se forem marcadas, o app avisa que voltam a dever.
- **Abrir e recolher:** abrir uma pessoa ou um pedido não rola mais a tela nem esconde o título atrás do cabeçalho; o título tocado fica parado. "Paga serviço", "Juntar", os ajustes da conta da mesa, a troca entre compartilhado e individual e os outros trechos que abrem e recolhem ganharam movimento.
- **Tampinhas e presente em 3D:** passaram a ser desenhados num canvas. No iPhone, as faces em CSS 3D trocavam de ordem durante o giro e a tampinha piscava.
- **Guia:** a faixa do guia não cobre mais o botão redondo do meio da barra.
- **Quem está na mesa:** a janela já abre com o cursor no nome, e o teclado fica aberto entre um nome e outro. O escurecido atrás das janelas cobre sempre a tela toda.
- **"Ver cupom":** só nos atalhos de cada pessoa (saiu de Detalhes e do cupom compartilhado, onde também saiu o "Desfazer", igual ao "Separar").
- **Início:** "Excluir esta comanda" na comanda em andamento, com Desfazer.

## 1.1.0 · 2026-11-14

Ajustes pedidos pelo Bruno depois de usar a 1.0.0 no iPhone.

- **Guia refeito do zero:** é do próprio app e segue a ordem de uso, sem saltos: abrir a comanda, pôr as pessoas, lançar (entre todos, individual, entre alguns), conferir, atalhos da pessoa, juntar, marcar pago, conta da mesa, comanda ao vivo, fechar, cupons, salvar, tampinhas, histórico, cadastros, sorteio, ajustes, ícones do alto e presente. A janela do guia fica num espaço só dela, acima da barra de baixo: não cobre nada e não muda de lugar. Antes de cada passo ela pisca e a moldura se esvazia no sentido do relógio. Dá para pausar, voltar, pular e sair.
- **A demonstração do guia não grava nada:** começa do zero na tela e, ao sair, os dados voltam como estavam; a sincronização continua trabalhando só com os dados reais.
- **Tampinhas em 3D:** cada tampinha é um objeto com esmalte, gomos e avesso de metal. Deslize o dedo de lado para girar (ou use as setas do teclado).
- **Presente novo:** caixa em 3D com laço, que também gira com o dedo. Na barra de cima, o presente é um ícone de traço.
- **Ícones redesenhados:** todos no mesmo traço. Os três do alto da tela têm a mesma cor.
- **Animações:** a comanda sai de dentro da fenda da impressora, aos trancos, e balança ao parar; a tampinha nova cai girando e para de frente.
- **Barra de baixo:** colada ao pé da tela e mais baixa.
- **Mais enxuto:** Cadastros, Sortear, Ajustes, Ver o guia e a comanda de exemplo. Avaliação, presente e novidades ficam no alto da tela e em Sobre o aplicativo; "Rever a apresentação" fica só nos Ajustes.
- **Ilustrações:** as telas vazias de Pessoas, Turmas, Produtos e Histórico mostram a coisa de que tratam.
- **Lançar item:** quantidade e valor lado a lado.
- **Sem bebida alcoólica:** exemplos, textos e nomes trocados; "Girar a garrafa" virou "Sortear alguém da mesa", com um ponteiro. Um teste confere.

## 1.0.0 · 2026-11-14

Conta Fácil refeito, pronto para a publicação oficial. O motor das contas, o Pix, a comanda ao vivo e a sincronização são os mesmos da 0.5.0; os dados de quem já usa o app continuam valendo.

- **Uma comanda só, de papel:** a mesa inteira fica numa folha: quem está na mesa e quanto paga, os pedidos e o total, montados em tempo real. O total fica sempre no alto; tocar nele abre a conta da mesa (serviço, couvert e desconto).
- **Lançar em uma janela:** produto, quantidade, preço e quem consumiu ficam juntos, com "entre todos" já marcado. O item novo entra no fim da lista, onde fica o botão, e pisca.
- **Pessoas:** tocar num nome mostra os atalhos (paga serviço, marcar como pago, juntar, ver cupom, detalhes). Segurar e arrastar um nome sobre outro junta os dois no mesmo cupom.
- **Pago:** marque quem já acertou. O alto da comanda mostra quanto falta, e o cupom ganha o carimbo PAGO, perto do total.
- **Couvert em R$ ou em %:** como o serviço e o desconto.
- **Fechar a comanda:** os cupons aparecem um por vez (a mesa primeiro), com Copiar e PDF em cada um; "Copiar todos" leva tudo de uma vez para o grupo. Salvar tem Desfazer.
- **Início novo:** a comanda sai de uma impressora. Lugares recentes abrem uma comanda com um toque; as últimas comandas viram tiras de papel.
- **Navegação nova:** Início, Histórico, a comanda no centro, Tampinhas e Mais (Cadastros, Ajustes, guia, avaliação e presente). No computador, um trilho lateral.
- **Tampinhas e níveis:** 16 tampinhas e 6 níveis, calculados do histórico e dos cadastros. Nenhuma premia gastar ou beber mais. Dá para desligar em Ajustes → Comandas e tampinhas.
- **Girar a garrafa:** sorteia alguém da mesa.
- **Histórico:** gasto dos últimos 6 meses, onde você mais vai, com quem mais sai e o que mais sai; comandas agrupadas por mês, em papel.
- **Cadastros:** Pessoas, Turmas e Produtos em três partes, com um só botão principal por tela.
- **Apresentação nova (onboarding):** quatro telas na primeira abertura, com uma divisão para experimentar. Dá para rever em Mais.
- **Guia refeito:** 12 etapas, na comanda de demonstração, que não salva nada.
- **Identidade visual:** azulejo e papel, com títulos em Bricolage Grotesque; tema claro e escuro; ícone novo.
- **Corrigido:** com o teclado numérico aberto, tocar em Lançar não perde mais o toque quando a barra do OK some.
- **Por dentro:** o app foi dividido em `app.js` (motor e comanda), `telas.js`, `jogo.js` e `casca.js`; estilos em `estilo.css` e `comanda.css`; testes do app reescritos (15).
- **Exceções ao Código do Projeto Fácil:** esta versão foi feita com liberdade para ignorar o Código. A lista do que foi ignorado e o porquê está no README, em "Exceções ao padrão".

## 0.5.0 · 2026-11-12

- **Presente no lugar do chopp (Kit Fácil 0.6.0, Código 0.5):** o convite de apoio agora é "Gostando do app? Mande um presente para o criador!". O ícone é um presente colorido, em 3D, que dá uma volta quando o app abre e ao ser tocado; quem pede menos movimento no aparelho vê o presente parado. A janela do Pix e *Sobre o aplicativo* mostram o presente maior, com papel de bolinhas e laço.

## 0.4.1 · 2026-11-11

- **Aviso rápido (Kit Fácil 0.5.0, Código 0.4):** o aviso com Desfazer não some enquanto tem o foco ou o ponteiro em cima; ao sair, a contagem recomeça.
- **Por dentro:** varredura automática de acessibilidade (WCAG 2.2 AA) e tela de 320 px nos testes.

## 0.4.0 · 2026-11-11

- **Janelas mais confortáveis (Kit Fácil 0.4.0, Código 0.3):** com o teclado aberto num campo de janela, no celular e no tablet, a janela fica acima do teclado; quando muda de lugar, desliza em 240 ms em vez de pular; o aviso rápido aparece acima dos botões do pé da janela aberta; a linha de apoio da janela vem abaixo do título.
- **Kit Fácil 0.4.0, peças novas para os próximos desenhos:** linha de adicionar no fim da lista, botão de fato (pago, feito) com Desfazer, item novo que a tela mostra e que pisca, carrossel de cartões, arrastar e soltar, texto só para leitor de tela e escala única de letras nas listas. Seções que abrem descontam o cabeçalho fixo do app.

## 0.3.0 · 2026-11-09

- **Telas mais limpas:** as telas principais não têm mais título visível nem linha de apoio (o título continua para o leitor de tela). Saíram também as dicas dentro das telas e das janelas. As listas vazias dizem só o essencial: "Nenhum item lançado", "Nenhuma comanda salva" e assim por diante.
- **Guia em vídeo (Kit Fácil 0.3.0):** um guia só, no lugar do Simplificado e do Completo. Cada etapa mostra só o título, que já diz o que fazer, e o app faz a ação na tela com um ponteiro que passeia até cada alvo, sem destaque e sem escurecer a tela. As etapas avançam sozinhas depois de uma pausa curta. No player: voltar, pausar ou continuar, avançar e fechar; tocar na tela também pausa. No teclado: Espaço pausa, as setas voltam e avançam e Esc fecha.
- **Comanda de exemplo:** não abre mais o guia sozinha. O guia começa pelo botão Guia do exemplo, por "Fazer o guia" na apresentação ou em Ajustes → Preferências gerais.
- **Exceções ao padrão:** telas sem título e sem linha de apoio (Art. 64, I e III) e guia único em vídeo (Arts. 77, 78 e 79), aprovadas pelo Bruno em 09/11/2026 e registradas no README. Proposta enviada ao Integrador para valer nos quatro apps.

## 0.2.1 · 2026-11-09

- **Início:** a comanda de exemplo é o último cartão da tela.
- **Comanda:** o botão Fechar a comanda fica fora da seção Itens da comanda, logo abaixo dela.

## 0.2.0 · 2026-11-08

- **Lançar item:** a janela tem o mesmo desenho da janela de Alterar. Em "Tipo de consumo", escolha Compartilhado (todos já vêm marcados; desmarque quem não consumiu) ou Individual (toque em +1 para dar as unidades de cada um) e toque em Lançar.
- **Guia simplificado:** passou de 6 para 13 passos e mostra também a comanda ao vivo, o serviço, couvert, desconto e cortesia, o cupom compartilhado, os cupons e o Histórico.
- **Guia completo:** textos em forma de instrução ("Digite…", "Toque em…"), sem narrar o que o app faz; os três pedidos da demonstração (compartilhado entre todos, individual e entre alguns) ficam num passo só.
- **Guia (Kit Fácil 0.2.0):** o dedo fica na ponta direita do campo e não cobre o que está sendo digitado; o cartão do guia não cobre a parte que está sendo mostrada nem a janela aberta, e encolhe enquanto o app faz o passo; o destaque não se perde ao tocar em +1.
- **Tablet deitado e computador (Kit Fácil 0.2.0):** as janelas ficam no centro da área do app, alinhadas ao conteúdo, e não mais deslocadas para o lado do menu.
- **Cupons:** centralizados e no tamanho de um cupom de papel (até 360 px); em tela larga, dois por linha. Exceção ao Art. 67 do Código, aprovada pelo Bruno em 08/11/2026 (veja "Exceções ao padrão" no README).
- **Exceções ao padrão:** o README ganhou a seção pedida pelo Art. 5º do Código, com as duas exceções aprovadas: a fonte IBM Plex Mono no cupom (Art. 55) e os cupons dois por linha em tela larga (Art. 67).

## 0.1.0 · 2026-11-08

- **Recomeço da numeração:** o Conta Fácil e o Kit Fácil recomeçam em 0.1.0, junto com o Código do Projeto Fácil 0.1 (rascunho). Tudo o que existia na 1.17.2 continua igual.
- **Segurança:** o código do app saiu de dentro do `index.html` para o `app.js`, e a política de segurança de conteúdo (CSP) não aceita mais script escrito dentro da página.
- **Kit Fácil 0.1.0:** teste das regras do Firestore no projeto de verdade (`npm run testar-regras`); verificação do padrão confere a CSP sem script dentro da página; Código e Anexos revisados (`comum/CODIGO.md` e `comum/ANEXOS.md`).
