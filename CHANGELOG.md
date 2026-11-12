# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`; enquanto a versão começar
com `0.`, o app está em fase de testes (rascunho).

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
