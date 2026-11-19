# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`; enquanto a versão começar
com `0.`, o app está em fase de testes (rascunho).

## 1.12.3 · 2026-11-19

- **Fechar a comanda, transição nova:** ao tocar em "Fechar comanda", a tela sobe até o topo e acontece o corte invisível. O preâmbulo (lugar, data e total) é o mesmo nas duas telas e não se mexe; cada linha de nome se destaca do papel e vira o seu canhoto, com o número, o nome e o valor saindo exatamente de onde estavam. Pedidos, total e botões saem por baixo, e o carimbo FECHADA bate no fim. Saiu a máscara verde da 1.12.2.
- **Reabrir a comanda, o filme ao contrário:** os canhotos voltam a se juntar no papel, viram linhas de novo e a comanda se desenrola (pedidos, total e botões).
- **Preâmbulo igual, aberta ou fechada:** a comanda fechada mostra o mesmo cabeçalho da aberta; o carimbo FECHADA e "Reabrir a comanda" ficam numa faixa logo abaixo. No canhoto, nome e valor têm o mesmo tamanho da linha da comanda.
- **Sem engasgo:** a animação só usa movimento e transparência, que o aparelho desenha sem refazer a tela; durante o corte os toques ficam travados, e nada sobra no fim. Quem pede movimento reduzido vê a troca direta.
- Testes: um teste novo grava a transição quadro a quadro, na ida e na volta, e confere que o preâmbulo não sai do pixel, que nenhum nome salta, vai e volta ou dá tranco, e que não fica fantasma na tela. Rodaram a verificação do padrão, a bateria completa (com o guia inteiro, que passa pela transição) e a acessibilidade.

## 1.12.2 · 2026-11-18

- **Transição em corte invisível:** ao fechar, o próprio botão "Fechar comanda" cresce até cobrir a tela (a máscara); a troca da comanda aberta pela fechada acontece escondida atrás dele; e a mesma forma verde encolhe até o lugar do carimbo FECHADA, onde vira o carimbo (o corte de correspondência), com a batida e a vibração curta. Saíram o picote entre as pessoas e os canhotos que giravam. Continua sendo um momento de marca (Código, Art. 72, § 4º); com movimento reduzido, a troca é direta.
- **"Fechar comanda" chama a atenção:** quando todos os itens estão divididos, um canvas desenha no botão, quadro a quadro, um picote que anda pela borda e um brilho que atravessa de tempos em tempos, com o ícone dando um pulinho. O ritmo vem de ruído e nunca se repete igual (animação procedural). Com item sem divisão, fora da tela ou com movimento reduzido, o botão fica quieto.
- **Cupom da mesa no mesmo padrão dos outros:** "Ver cupom da mesa" abre a janela com o cupom, e "Compartilhar" manda o PDF. Saíram "Copiar a comanda" e "PDF da mesa".
- **"Reabrir a comanda" repaginado:** deixou de ser um texto sublinhado e virou botão contornado, com o ícone de cadeado aberto, à direita do carimbo; a data foi para baixo do nome do lugar.
- **Selo PAGO de volta à comanda aberta:** quem pagou aparece com o selo na linha. O resto do pagamento continua só na comanda fechada.
- **Guia:** *Feche a comanda* passou a abrir o cupom da mesa. Continua com 34 passos.
- **Testes:** rodaram a verificação do padrão, a bateria completa e a acessibilidade.

## 1.12.1 · 2026-11-18

- **Comanda aberta sem nada de pagamento:** saíram dela os botões "Desmarcar pago", "Recebi" e "Devolvi", o carimbo PAGO nas linhas, as linhas "pagou x · falta y", o aviso "A conta de quem já pagou mudou", o valor que falta em vermelho no cabeçalho e o total riscado. Pagamento se marca, desmarca e acerta só com a comanda fechada, no canhoto da pessoa.
- **O que ficou na comanda aberta, de propósito:** "saiu da mesa" ao lado do nome (a pessoa fica travada, e a tela precisa dizer por quê) e os avisos de consequência ao mexer na conta ou lançar item ("Isso mexe com quem já pagou", "Ana já pagou e ficou de fora").
- **Canhoto aberto com "Ver cupom":** abre a janela do cupom, como na comanda aberta; o cupom não fica mais dentro do canhoto, e o botão "Compartilhar" do canhoto saiu (fica na janela do cupom).
- **Cupom compartilhado em PDF:** "Compartilhar", na janela do cupom, manda o PDF direto para a folha de compartilhar do aparelho. Antes abria outra janela, para escolher entre texto, PDF e imagem. A janela do cupom não tem mais botão de pagamento.
- **"Já saiu da mesa":** virou uma linha com a chave, igual às linhas "Paga serviço" da comanda aberta; antes era uma caixa com a chave desalinhada.
- **Sem "Tudo recebido" sobre o botão:** com tudo recebido, fica só o "Salvar no histórico" em destaque (a barra cheia e o check já dizem isso). "Faltam R$ …" continua enquanto falta.
- **Guia:** em *Receba de cada um* e *A conta de quem já pagou mudou*, o cupom abre em janela, e a diferença de quem já pagou é acertada depois de fechar de novo. Continua com 34 passos.
- **Testes:** rodaram a verificação do padrão, a bateria completa (a mudança mexe em pagamento e no guia) e a acessibilidade.

## 1.12.0 · 2026-11-18

- **Fechar a comanda sem janela (opção C, aprovada pelo Bruno):** tocar em "Fechar comanda" transforma a própria tela. O papel é destacado em um canhoto por pessoa, com nome e valor. A comanda fechada não aceita pedido nem pessoa nova; o único caminho de volta é "Reabrir a comanda". Saem o carrossel de cupons e o botão "Voltar à comanda".
- **A transição:** o picote se desenha entre as pessoas, cada canhoto sai de onde a pessoa estava, gira, solta e assenta, e o carimbo FECHADA bate no cabeçalho, com uma vibração curta. É um momento de marca (Código, Art. 72, § 4º), como a festa de fechamento; quem pede movimento reduzido vê a troca direta.
- **Receber é carimbar:** "Marcar como pago" fica no próprio canhoto. A barra "Recebido" enche passando do ponto e voltando, murcha ao esvaziar e, com tudo recebido, estufa e ganha um check; aí "Salvar no histórico" vira o botão principal. Antes disso ele é discreto, com "Faltam R$ …".
- **Canhoto aberto:** a seta abre o cupom da pessoa ali mesmo, com "Compartilhar" (o PDF por pessoa saiu: repetia o Compartilhar), "Pagar valor diferente" (antes, "Pagar outro valor"), "Já saiu da mesa" e as escolhas de quem cobre ou devolve a diferença.
- **"Receber com Pix" só aparece quando serve:** você tem chave Pix em *Você nas comandas*, o canhoto não é o seu e ainda falta receber dele. Abre o QR code e o copia e cola com o valor que falta. Com todos pagos, o botão não existe.
- **Saiu "Uma pessoa paga a conta de todos"** (pedido do Bruno). Comandas antigas que usavam a opção passam a mostrar cada um pagando o seu.
- **Comanda da mesa termina no total:** saiu a parte final com o pagamento de cada pessoa. No lugar dos cupons da mesa, a tela tem "Copiar a comanda" e "PDF da mesa".
- **Não fecha com item sem divisão:** o app avisa "Divida todos os itens antes de fechar a comanda.".
- **Guia:** os passos *Feche a comanda*, *Receba de cada um* (novo nome), *A conta de quem já pagou mudou* e *Salve no Histórico* foram refeitos para os canhotos. Continua com 34 passos.
- **Dados:** "fechada" fica só no aparelho, como "pago" e "já saiu da mesa"; a comanda salva fechada abre em canhotos pelo histórico.
- **Regras do Conta Fácil:** texto novo do Art. 8º (Fechar a comanda em canhotos, sem janela e sem "uma pessoa paga a conta de todos") aprovado pelo Bruno em 18/11/2026. As Regras ficam nas instruções do Projeto, que só o Bruno edita.
- **Testes:** rodaram a verificação do padrão, a bateria completa (a mudança mexe em Fechar, no cupom da mesa e no guia) e a acessibilidade, agora com a comanda fechada no claro e no escuro.

## 1.11.1 · 2026-11-18

- **Fechar a comanda, cupom da mesa:** o botão "Copiar todos" virou "Copiar" e copia só a comanda da mesa (antes copiava a da mesa e, em seguida, o cupom de cada pessoa). O aviso passou de "Todos os cupons copiados." para "Comanda da mesa copiada.". O cupom de cada pessoa continua com o seu "Copiar".
- **Testes:** rodaram a verificação do padrão, o teste novo desta mudança e os de Fechar a comanda. Pulados: o guia inteiro (a mudança não mexe no guia) e a bateria completa (as contas não mudaram).

## 1.11.0 · 2026-11-18

- **Pix de celular e de CPF consertado:** ao salvar uma chave de 11 números (celular sem pontuação, "85 99999-8888" ou CPF sem pontos), o app dava erro por dentro e a chave não era guardada. A conferência de CPF tinha ido para o Kit na 1.10.0 e o app continuava chamando a antiga. Agora a chave é salva: CPF só com números, celular com +55.
- **Chave fora do formato é avisada na hora:** celular sem DDD, CPF com número errado e e-mail incompleto não são mais aceitos em silêncio (o banco recusaria o Pix). A janela continua aberta e o campo é apontado.
- **A chave aparece como se lê:** "(85) 99999-8888" e "529.982.247-25" nos Cadastros, no cupom e nos acertos. O copia e cola continua no formato do Banco Central.
- **Cadastros, alterar pessoa:** o lápis de cada pessoa abre uma janela só, com nome, chave Pix e "Sou eu" (antes só dava para mexer na chave Pix, e o nome não mudava em lugar nenhum).
- **Cadastros, alterar produto:** o lápis abre a janela com o nome e o preço em cada lugar. A lista passou a só mostrar os preços; antes, eles eram caixas de texto soltas na lista, e o nome não podia ser mudado.
- **Nome novo vale no histórico:** mudar o nome de uma pessoa ou de um produto muda também nas comandas salvas, nas turmas e na comanda aberta, para as contagens ("em 3 comandas salvas") seguirem o cadastro. Tem Desfazer.
- **Turmas:** o botão "Alterar" virou o mesmo lápis das outras listas.
- **Sortear alguém da mesa saiu de Tampinhas:** fica só em Mais (Código, Art. 64-B: cada função num lugar só).
- **Quantidade igual às outras caixas de texto:** o − n + da janela de lançar tem o mesmo fundo, contorno, altura, letra e anel de foco do campo de valor, e os dois ficam alinhados.
- **Quem não paga o serviço:** tocar numa opção só marca o check. No pé, "Cancelar" e "Confirmar" entram no lugar de "Fulano paga o serviço". Cancelar (ou fechar no X) devolve o serviço à pessoa.
- **Guia:** os passos *Quem não paga o serviço* e *Cadastros: pessoas e Pix* seguem as janelas novas. Continua com 34 passos.
- **Por cima do Kit (Art. 30-A), na Proposta 5 para o Integrador:** a aparência do passo a passo de quantidade e a conferência de CPF e de chave Pix.
- **Testes:** rodaram a verificação do padrão, o teste novo desta versão, os de Cadastros, Pix, Tampinhas, Mais, janelas e botões de exclusão, a acessibilidade e o guia inteiro (a mudança mexe no guia). Pulada: a bateria completa, porque as contas não mudaram.

## 1.10.1 · 2026-11-18

- **PDF do cupom bem mais leve:** a imagem do cupom entra no PDF compactada, sem perder qualidade. Um cupom que saía com 5 MB agora sai com menos de 200 kB, e o "Todos em PDF" de uma mesa de seis pessoas caiu de 33 MB para 1 MB. O desenho do cupom é o mesmo, ponto por ponto.
- **Por dentro:** o `canvasesToPDF` (em `app.js`) passa a pedir a compactação `FAST` ao jsPDF; antes, cada ponto da imagem ocupava 4 bytes no arquivo. Um teste novo confere isso. O `package-lock.json`, parado na 1.8.0, voltou a acompanhar a versão.

## 1.10.0 · 2026-11-15

Kit Fácil 0.9.0 e Código 0.9 (Proposta 4 para o Integrador, aprovada pelo Bruno).

- **Guia, a janela fica aberta de um passo para o outro** (Código, Art. 78, IV, novo): *O pagamento de cada um* (18) acontece na janela que *Feche a comanda* (17) deixou aberta, e *Salve no Histórico* (20) na que *A conta de quem já pagou mudou* (19) deixou. A janela de Fechar a comanda abria quatro vezes nesses passos; agora abre duas. O guia continua com 34 passos.
- **Janelas sem "Fechar" sozinho no pé:** Avaliação e feedback, Sobre o aplicativo e Mensagem enviada fecham pelo X (Art. 68, § 1º).
- **Por dentro, o app larga as soluções próprias (Art. 30-A):** saíram do `estilo.css` o desenho da janela de Avaliação e feedback e o pé livre da tela de "Conta fechada" no guia; saíram do `casca.js` o `naJanela`, o `demoArea` e a rolagem da tela de "Conta fechada". Tudo isso agora é do Kit 0.9.0. A tela de "Conta fechada" leva `data-kf-tela-cheia`, e os campos do Kit seguem os do app pelas variáveis `--kf-campo-*`.
- **Kit:** o CSS perdeu 184 regras repetidas (19 kB a menos); quatro testes novos.

## 1.9.6 · 2026-11-15

- **Guia, passo a passo:**
  - *16, Serviço, couvert e desconto:* a ordem mudou. O guia liga a chave, espera a opção abrir e só então a destaca inteira, já à vista na janela; depois escreve o valor. Antes, destacava a opção ainda fechada.
  - *19, A conta de quem já pagou mudou:* o destaque abraça toda a área de PAGAMENTO do cupom, como nos passos 17 e 18.
  - *29, Sorteie alguém da mesa:* o guia não destaca mais quem saiu; a roda e a linha "Saiu …" continuam à vista.

## 1.9.5 · 2026-11-15

- **Guia, passo a passo (numeração nova, de 34 passos):**
  - *16, Serviço, couvert e desconto:* cada opção é destacada, já à vista na janela, antes de receber o valor: serviço; couvert, e só então liga e escreve; desconto, e só então liga e escreve.
  - *17, Feche a comanda:* o destaque abraça toda a área de PAGAMENTO do cupom (o título e todas as linhas), e não só a linha do Bruno. Saiu o destaque de Copiar e PDF.
  - *18, O pagamento de cada um:* o destaque abraça toda a área de PAGAMENTO, e não só "Paga ao local". Ao voltar para a comanda, o guia não destaca mais nada.
  - *20, Salve no Histórico:* a tela de "Conta fechada" rola até o botão Concluir antes do toque; no guia, ela deixa livre o pé da tela, onde fica a janela do guia. Antes, o botão ficava escondido atrás dela.
  - *29, Sorteie alguém da mesa:* a roda fica inteira à vista, com o nome do alto (Ana), e o destaque abraça só o texto "Saiu …", na altura certa.
- **Por dentro:** o guia do app ganhou o destaque de área (`demoArea` em `casca.js`): um anel só em volta de vários elementos seguidos ou do texto de uma linha.

## 1.9.4 · 2026-11-15

- **Guia com 34 passos (decisão do Bruno):** os quatro passos da janela de Fechar a comanda viraram dois, para ela não abrir e fechar o tempo todo.
  - *Feche a comanda* (antes, "Feche a comanda" e "Uma pessoa paga a conta de todos"): abre a janela, mostra o cupom da mesa, põe uma pessoa para pagar a conta de todos, mostra quanto cada um deve a ela, aponta Copiar e PDF e volta a cada um pagar o seu.
  - *O pagamento de cada um* (antes, "Pague outro valor" e "Marque quem já pagou"): no cupom da Ana, marca que ela pagou e que já saiu; segue para o cupom da Carla, na mesma janela, e mostra o outro valor com a escolha de quem cobre.
- **Textos novos:** "Um cupom por pessoa, a mesa primeiro. No da mesa, uma pessoa pode pagar a conta de todos." e "No cupom da pessoa, marque quem já pagou. Vai pagar outro valor? Diga quem cobre a diferença."
- **Regras do app:** o Art. 13 fala em 36 passos; o texto das Regras fica nas instruções do Projeto e precisa passar a dizer 34.

## 1.9.3 · 2026-11-15

- **Quem chega depois não entra sozinho nos itens (regra do Bruno):** ao adicionar uma pessoa com itens já lançados, nenhum deles é atribuído a ela. Para pôr a pessoa num item, abra o item e marque o nome. Antes, ela entrava sozinha nos itens divididos "entre todos", com um aviso e um Desfazer. Na janela de lançar, o resumo diz só "Entre todos" (saiu "quem chegar depois também entra").
- **Consequência:** a chegada de alguém não mexe mais na conta de quem já pagou.
- **Guia, passo a passo:**
  - *Quem não paga o serviço:* destaca as duas opções antes de escolher.
  - *O cupom de cada um:* o cartão do Diego se recolhe no fim.
  - *Mude o nome ou tire da mesa:* ao adicionar Eva não aparece mais o aviso com Desfazer por cima do dedo (ele deixou de existir com a regra acima).
  - *Comanda ao vivo:* saiu "Aqui, só o botão.".
  - *Pague outro valor:* um caminho só, de cima para baixo: abre o campo, escreve o valor, escolhe quem cobre, sobe uma vez para ver o cupom e desce uma vez para voltar ao valor da conta. O dedo não para mais em cima de "Salvar no histórico".
  - *Salve no Histórico:* não destaca mais o nível.
  - *Produtos e preços:* não destaca mais o preço.
  - *Sorteie alguém da mesa:* depois de tocar em Sortear, o dedo sai da frente e a roda vem para o alto da janela; vê-se o ponteiro girar e o nome que saiu.
- **Erro do Kit corrigido por cima (Art. 30-A):** o guia só conferia se o alvo cabia na tela. Numa janela, o alvo podia estar escondido atrás do pé dela, e o dedo tocava em cima de um botão do pé. Agora, no guia do app, o alvo vem para a parte visível da janela antes do toque. Está na Proposta 4.
- **Testes:** como a mudança mexe nas contas, rodou a bateria completa.

## 1.9.2 · 2026-11-15

- **Um ícone só:** a marca no alto da tela (e no trilho lateral, no computador) passou a ser o ícone do app, o mesmo de Sobre o aplicativo: a comanda inclinada com o selo dourado. Antes era um desenho mais simples, só da comanda.
- **Não muda:** o ícone da tela de início do celular, o do navegador e o da instalação já eram esse.

## 1.9.1 · 2026-11-15

- **Janela de Avaliação e feedback redesenhada:** "Avaliar o app" e "Relatar um problema" eram duas pílulas com o texto encostado na borda e o apoio em negrito. Agora são duas linhas no padrão do app: ícone, título, apoio e seta, separadas por uma linha. O mesmo vale na guia Avaliação e feedback dos Ajustes.
- **A causa:** no Kit, duas peças diferentes usam o mesmo nome de classe (`.kf-escolha`): a opção do feedback e a pílula de escolher um valor. A regra da pílula vinha depois e amassava as opções do feedback.
- **Sem "Fechar" no pé:** a janela que só precisa ser fechada fecha no X (Código, Art. 68, § 1º). Saiu o botão "Fechar" dessa janela e das outras janelas do Kit em que ele era o único botão do pé.
- **Formulários de avaliar e de relatar:** a caixa de texto grande ficou igual aos outros campos do app (antes era branca, com outra borda), e "O que é enviado e para onde" abre com a mesma seta das outras linhas, no lugar do triângulo do navegador.
- **Kit passado por cima (Art. 30-A):** tudo no `estilo.css` do app; o conserto no Kit está na `PROPOSTA-4-PARA-O-INTEGRADOR.md`.

## 1.9.0 · 2026-11-15

- **Kit Fácil 0.8.0:** o app passou a usar as peças novas do Kit, que vieram dele mesmo (Proposta 3, aprovada no Integrador): puxar a janela pela barrinha, cursor só com a janela parada, pé da janela recolhido com o teclado, campo apontado sem foco e o vermelho de excluir. Para quem usa, tudo continua igual.
- **Janela que fecha:** o conserto do pulo ao fechar uma janela com lista de escolha agora é do Kit; o remendo próprio do app saiu (`comanda.css`).
- **Por dentro:** saíram do app o gesto de puxar e o cursor parado (`casca.js`), as regras de toque, da barrinha, do pé recolhido e do contorno do campo apontado (`estilo.css`) e o vermelho próprio `--cf-excluir` (agora `--kf-perigo-fundo`, do Kit).

## 1.8.7 · 2026-11-15

- **Todo botão de exclusão é vermelho (regra do Bruno):** "Excluir esta comanda" (Início), "Remover da mesa" (Editar pessoa), "Remover" (item da comanda, lançado ou ainda por dividir), "Excluir" (comanda do histórico) e "Restaurar padrões de fábrica" (Ajustes) ficaram vermelhos e cheios, como "Excluir comanda".
- **Confirmações:** o botão que confirma excluir, remover ou apagar também é vermelho, em todas as janelas de confirmação.
- **Cadastros:** a lixeira de pessoa, turma e produto e o X de apagar preço têm o ícone vermelho, sem precisar passar o mouse.
- **Início:** "Excluir esta comanda" ganhou a largura de "Continuar a comanda".
- **Modo escuro:** os botões vermelhos usavam um vermelho claro com texto branco, difícil de ler (contraste perto de 2,5:1). Agora é o mesmo vermelho do modo claro, com contraste 5,9:1.
- **Não muda:** "Encerrar" e "Sair" da comanda ao vivo e "Desfazer" não excluem a comanda e continuam como estavam.

## 1.8.6 · 2026-11-15

- **Nenhum botão sobe para cima do teclado (regra do Bruno):** com o teclado aberto, o pé da janela (Cancelar e Lançar, Salvar, Adicionar) se recolhe, em todas as janelas; ao fechar o teclado, ele volta. Antes, isso só acontecia em Fechar a comanda.
- **Mais espaço:** com o pé recolhido, sobra mais conteúdo à vista acima do teclado.
- **Como concluir:** feche o teclado e toque no botão.
- **Não muda:** o botão que fica na mesma linha do campo (Adicionar, em Quem está na mesa) continua ao lado dele. O guia não puxa a janela para fechar e não ganha passo novo para isso (decisão do Bruno).

## 1.8.5 · 2026-11-15

- **Cursor fora da caixa de texto:** ao tocar num campo, a janela sobe com o teclado, e o cursor azul ficava para trás, abaixo do campo, até a janela parar. Quem desenha o cursor é o iPhone, e ele não acompanha a janela em movimento. Agora o cursor só aparece com a janela parada, já dentro da caixa (cerca de um terço de segundo depois do toque). O que se digita aparece normalmente.
- **Vale também** quando a janela muda de altura com um campo em foco.
- **Própria do app, a levar ao Kit:** está em `casca.js` e no `estilo.css`; entra na Proposta 3.

## 1.8.4 · 2026-11-15

- **A janela só se move pela barrinha (regra do Bruno):** arrastar o dedo em qualquer outro ponto da janela (um rótulo, um nome, o espaço entre os campos) não move mais nada. Antes, o iPhone rolava a página por trás e a janela subia junto.
- **Rolagem:** quando o conteúdo é maior que a janela, ele rola normalmente; ao chegar ao começo ou ao fim, para ali, sem puxar a página.
- **Não muda:** puxar pela barrinha para fechar, tocar em botões, campos e chaves, e arrastar o cupom de um lado para o outro.

## 1.8.3 · 2026-11-15

- **Puxar a janela para baixo:** a barrinha no alto da janela agora funciona. Puxe pelo cabeçalho e a janela acompanha o dedo; soltou depois de um terço da altura, ou num puxão rápido, ela fecha, como no X; soltou antes, volta para o lugar. Vale para todas as janelas, no celular e no tablet. O X e o Esc continuam.
- **O que bugava:** a barrinha era só um desenho. Arrastar ali rolava a página por trás (a janela subia e cortava o conteúdo), e tocar e segurar selecionava o título, com o menu Copiar do iPhone. O cabeçalho e o rodapé das janelas não rolam mais a página nem selecionam texto.
- **Sem pulo:** a janela puxada fecha a partir de onde o dedo deixou, em 600 ms, sem voltar ao alto antes.
- **Guia:** durante o guia, puxar não fecha a janela. O gesto ainda não tem passo próprio no guia (decisão do Bruno: Regras, Art. 13).
- **Própria do app, a levar ao Kit:** o gesto está em `casca.js` e no `estilo.css`; entra na Proposta 3.

## 1.8.2 · 2026-11-15

- **Pulo ao fechar no X:** a janela que tem lista de escolha (como "Pôr uma turma na mesa", em Quem está na mesa) dava um pulo para cima ao fechar. O que desce pela tela é uma cópia da janela; o Kit tomava a lista de escolha da cópia por uma lista nova e montava outra embaixo dela, e a cópia ficava uma linha mais alta. Agora a cópia sai com a mesma altura da janela, sempre.
- **Kit passado por cima (Art. 30-A):** a correção está no CSS do app (`comanda.css`), sem mexer em `comum/`. O conserto de verdade é do Kit (a cópia de saída não deve ser religada) e está na `PROPOSTA-3-PARA-O-INTEGRADOR.md`, junto com o campo que o Kit ainda seleciona sozinho em "Relatar um problema".
- **Teste novo:** toda janela do app é fechada e a cópia que sai tem de ter a altura e o topo da janela original, do primeiro ao último quadro.

## 1.8.1 · 2026-11-15

- **Caixa de texto nunca é selecionada sozinha (regra do Bruno):** o teclado só sobe quando a pessoa toca no campo. A regra da 1.7.0 valia para a abertura das janelas; agora vale para o app inteiro.
- **Pôr uma turma na mesa:** as pessoas entram e o campo Nome fica como estava; antes ele era selecionado e o teclado subia. Quem está digitando nomes continua no campo entre um nome e outro, como antes.
- **Campo que falta preencher:** o aviso diz o que falta e o campo ganha um contorno vermelho, sem ser selecionado (local, nome do item, valor, nome da pessoa, nome da turma).
- **Pagar outro valor** e **código da comanda ao vivo:** o campo aparece e espera o toque; antes já abria selecionado.
- **Item no computador:** escolher um produto sugerido não leva mais o cursor para a quantidade.
- **Não muda:** quando a tela é redesenhada com a pessoa digitando, o foco volta para o campo em que ela estava.
- **Depende do Kit:** em Avaliação e feedback, "Relatar um problema" sem descrição ainda seleciona o campo; a correção é do Kit e vai como proposta ao Integrador.

## 1.8.0 · 2026-11-15

- **Kit Fácil 0.7.0:** as peças do Conta Fácil foram para o Kit e o app passou a usar as do Kit, como os outros apps: o mecanismo único das janelas (nascer, acompanhar o teclado, mudar de altura, trocar e sair pelo pé), o relógio de 600 ms, a barra de baixo com a comanda no centro e o trilho com Mais e Ajustes no pé, a barra de cima com nuvem, presente e balão em traço, a janela do apoio com o presente em 3D, a abertura de quatro telas, o motor do guia, o campo com sugestões, os campos de dinheiro e porcentagem, a quantidade com − e +, a chave, os botões de escolha, a confirmação, o Pix de cobrança e o motor das tampinhas em 3D (`comum/kit-jogo.js`). Saíram do app: o ajuste provisório que trocava as durações do Kit, o próprio módulo das janelas e as cópias de código e de CSS dessas peças.
- **Janela do presente:** o texto diz "É opcional: o Conta Fácil continua igual para todos, com presente ou sem." (antes: "o app continua igual para todos").
- **Mais:** os Ajustes passaram para o fim da tela, depois do guia e da comanda de exemplo (Código, Art. 60, II).
- **Leitores de tela (WCAG 2.5.3):** o nome que o leitor de tela fala começa pelo texto que está na tela, nas linhas de pessoas e pedidos da comanda, no local, na conta da mesa, nos botões −1 e +1 e nas tampinhas da coleção. O que só o leitor de tela ouve ("Mostrar atalhos", "Na coleção") vem depois. A varredura de acessibilidade passa em todas as telas, nos dois temas.
- **Segurança:** o QR code do Pix de cobrança agora carrega a biblioteca com a impressão digital (SRI), como o do apoio; antes o app a buscava sem conferência.

## 1.7.0 · 2026-11-15

- **Um relógio só (regra do Bruno):** tudo o que o app abre ou fecha dura 600 ms, na mesma curva (começa macio e pousa devagar): janelas, fundo escuro, linhas e trechos que abrem e recolhem, lista de sugestões, troca de tela, avisos, apresentação e festa. A duração está escrita num lugar só (`MOVE` em `app.js`, `--cf-ms` e `--cf-curva` no CSS). Antes havia 180, 220, 240, 260, 280, 440 e 560 ms espalhados, e a janela nascia numa curva que fazia quase todo o caminho no primeiro instante: era o "rápido demais" do vídeo.
- **Janelas todas iguais:** um módulo só cuida de nascer, sair, trocar e mudar de altura, para qualquer janela, do app ou do Kit. A novidade é a saída: a janela desce pelo pé da tela em 600 ms e o fundo clareia junto (o Kit sumia com ela em 200 ms).
- **Nenhuma janela abre com a caixa de texto selecionada:** o foco vai para a janela, e o teclado só sobe quando a pessoa toca no campo. Vale para todas as janelas do app, no celular e no computador.
- **Quem está na mesa:** o botão Adicionar fica alinhado ao campo, com a mesma altura; a lista de sugestões abre abaixo da linha inteira. Saiu o botão "Pronto", que repetia o X e ocupava espaço; pelo mesmo motivo saiu o "Pronto" do cupom compartilhado e da conta da mesa.
- **Teclado:** quando o teclado sobe com alguma coisa ainda abrindo dentro da janela (a lista de sugestões, o campo de "Pagar outro valor"), só a janela se move até ele assentar; a lista de sugestões abre em seguida. Corrigido também um quadro em que o conteúdo descia 23 px e voltava, bem no fim da subida do teclado (vinha da 1.6.1).
- **Guia na ordem do app:** "Serviço, couvert e desconto" vem antes de "Feche a comanda". Em "A conta de quem já pagou mudou", o desconto cai depois que Ana pagou.
- **O que ainda depende do Kit:** menus, listas e calendário do Kit fecham em 200 ms. Para o Kit 0.6.0 seguir os 600 ms sem mexer em `comum/`, o app acerta a duração das chamadas dele (Arts. 30-A e 93, § 1º). O que levar para o Código e para o Kit 0.7.0 está em `PROPOSTA-2-PARA-O-INTEGRADOR.md`.
- **Não muda:** a janela acompanhando o teclado continua em cerca de 300 ms, porque quem abre o teclado é o iPhone e a janela precisa chegar junto com ele.

## 1.6.1 · 2026-11-14

- **Tranco ao abrir e fechar o teclado:** no iPhone, a janela saltava para cima num quadro, passava do ponto e voltava (e o contrário ao fechar). A posição e a altura da janela mudavam por transições de CSS separadas, e o iPhone não as mantinha no mesmo ritmo: a posição andava na frente da altura, e o topo da janela ia além do lugar. Agora não há transição nenhuma: o desenho muda de uma vez, e o que se vê é um movimento só, feito com `transform` e num relógio só, para a janela, o conteúdo, o rodapé e a borda de baixo. Ao abrir, a janela fica com o desenho alto até o movimento terminar (nada some antes de o teclado cobrir); ao fechar, o desenho alto entra no começo. Se o teclado mudar de altura ou voltar no meio do caminho, o movimento continua de onde a janela está.
- **Espaços iguais com e sem teclado:** o título, o conteúdo e o rodapé das janelas não apertam mais quando o teclado abre (era mais uma coisa mudando de lugar na hora). Em troca, com o teclado aberto cabe um pouco menos de conteúdo sem rolar.
- **Campo à vista:** com o teclado já aberto, o campo que recebe o foco vem para a parte visível da janela.
- **Rede de segurança:** se o Safari empurrar a tela com uma janela aberta, ela volta para o lugar quando o teclado assenta.
- **Regra de trabalho (não muda o app):** a partir daqui, antes de publicar rodam a verificação e só os testes da parte alterada; o guia inteiro e a bateria completa ficam para quando a mudança mexe neles.
- **O Conta Fácil é a referência do Projeto Fácil (não muda o app):** decisão do Bruno em 14/11/2026. O que estava no README como "Exceções ao padrão" passou a ser "O novo padrão", e o texto para atualizar o Código, o Kit e as Regras do app está em `PROPOSTA-PARA-O-INTEGRADOR.md`.

## 1.6.0 · 2026-11-14

- **Quem fica com a diferença:** em Fechar a comanda, quem paga outro valor (a mais ou a menos) escolhe com quem fica a diferença: "Os outros dividem" (padrão) ou uma pessoa só. Quem cobre paga a mais ao local; quem devolve paga a menos ao local e acerta com a pessoa. O cupom de cada um mostra os acertos.
- **A conta de quem já pagou mudou:** além de "Recebi" ou "Devolvi", outra pessoa pode ficar com a diferença ("Outro cobre" ou "Outro devolve" no aviso da comanda, e as mesmas escolhas no cupom da pessoa). O que ela pagou passa a valer como o valor do cupom dela.
- **Quem já pagou não entra no rateio dos outros:** se alguém paga menos e ninguém foi escolhido para cobrir, a diferença é dividida só entre quem ainda vai pagar.
- **Já saiu da mesa:** depois de marcar como pago, uma chave trava o cupom da pessoa. Ela aparece travada ao lançar ou alterar pedidos, não entra em item novo (nem nos "entre todos"), não pode ser juntada nem arrastada, e na comanda só tem "Ver cupom". Desmarcar o pagamento ou a chave destrava.
- **Sorteio:** quem entra é escolha de quem sorteia. A mesa vem marcada, cada nome liga e desliga com um toque, as pessoas dos cadastros ficam disponíveis e dá para pôr um nome avulso (até 12).
- **Quem é você:** o nome agora se escreve em Ajustes → Conta e perfil (antes só dava para escolher entre cadastros que já existissem) e há a chave "Sou eu" em Nova pessoa, nos Cadastros. Quem diz o nome na apresentação recebe ali mesmo a tampinha "Prazer, eu".
- **Excluir comanda:** em vermelho, da mesma largura de Fechar comanda.
- **Fechar a comanda:** tudo o que fica embaixo do cupom (Copiar e PDF, Marcar como pago, Pagar outro valor, "Uma pessoa paga a conta de todos") tem a mesma largura. Com o teclado aberto, o rodapé (Voltar e Salvar) se recolhe em vez de subir junto.
- **Abrir um nome ou um pedido:** a tela ia até o topo e voltava. Dois defeitos: o destino da rolagem só era acertado no fim, e o tratamento era ligado de novo a cada redesenho da comanda (depois de várias mudanças, cada toque disparava várias rolagens ao mesmo tempo). Agora o destino é calculado antes e a tela vai até lá num movimento só.
- **Guia:** em "Separe quando quiser" a seção Paga serviço não abre mais, e cada cupom separado é destacado; em "Uma pessoa paga a conta de todos" o aviso não cobre mais o destaque do pagamento; "Ajustes" não entra mais em Aparência; os passos de pagamento mostram quem cobre a diferença e a chave "Já saiu da mesa"; o sorteio marca quem entra.

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
