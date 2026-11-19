# Conta Fácil

Divida a conta da mesa sem calculadora: cada um paga o que consumiu, com serviço, couvert, desconto e Pix.

Versão **1.12.6** · Kit Fácil 0.9.0 · app web em <https://brunodecastrosilva.github.io/conta-facil/>

Faz parte do **Projeto Fácil** (Conta Fácil, Elétrica Fácil, Estudo Fácil e Guitarra Fácil). Desde 14/11/2026,
**o Conta Fácil é a referência do Projeto Fácil** para a moldura, os componentes e o comportamento dos controles; o
fluxo e o desenho das telas são dele, feitos para a comanda de bar ([Código do Projeto Fácil](comum/CODIGO.md), Art. 93).

## O que o app faz

- **Uma comanda só, de papel:** quem está na mesa e quanto paga, os pedidos e o total ficam na mesma folha, montada em tempo real
- **Lançar em uma janela:** produto, quantidade, preço e quem consumiu (compartilhado, entre todos ou entre alguns, ou individual, por unidade)
- **Pessoas:** tocar num nome mostra os atalhos (serviço, couvert, Juntar, Ver cupom e Editar, que muda o nome ou tira da mesa); segurar e arrastar um nome sobre outro junta os dois no mesmo cupom
- **Conta da mesa:** serviço, couvert e desconto em R$ ou em %, e cortesias
- **Fechar a comanda:** não abre janela; a própria comanda muda, num corte invisível: a tela sobe até o topo, o preâmbulo (lugar, data e total) fica parado e cada linha de nome se destaca do papel e vira canhoto. Reabrir é o mesmo filme ao contrário. Pronto para fechar, o botão chama a atenção com um pulso (respira e solta dois anéis); "Salvar no histórico" faz o mesmo quando tudo foi recebido. O papel é destacado em um canhoto por pessoa, e a comanda fechada não aceita pedido novo. O único caminho de volta é "Reabrir a comanda"
- **Receber:** em cada canhoto, "Marcar como pago" põe o carimbo, e a barra de recebido mostra quanto já entrou; "Salvar no histórico" é o botão principal da comanda fechada. Se a conta mudar depois de paga (comanda reaberta, desconto, item novo), o app mostra quanto falta ou quanto devolver
- **Comanda aberta sem pagamento:** marcar, desmarcar, carimbo, "falta" e diferença de quem já pagou só existem com a comanda fechada. Aberta, a comanda mostra nomes, valores e o selo PAGO de quem pagou (quem já saiu da mesa continua marcado, porque fica travado)
- **Canhoto aberto:** "Ver cupom" (a janela do cupom, com "Compartilhar" em PDF), "Receber com Pix" (só aparece quando serve: você tem chave Pix em "Você nas comandas", o canhoto não é o seu e ainda falta receber), "Pagar valor diferente" (com a escolha de quem cobre ou devolve a diferença) e "Já saiu da mesa" (trava o canhoto)
- **Cupom da mesa:** "Ver cupom da mesa" abre o cupom, que termina no total; "Compartilhar" manda o PDF
- **Comanda ao vivo:** cada pessoa marca o que consumiu pelo próprio celular e todos veem as mudanças na hora
- **Histórico:** gasto dos últimos 6 meses, onde você mais vai, com quem mais sai e o que mais sai
- **Cadastros:** pessoas e chaves Pix, turmas (quem sai junto entra na mesa com um toque) e preço de cada produto em cada lugar; o lápis de cada linha altera a pessoa (nome, chave Pix e "sou eu"), a turma ou o produto (nome e preços), e o nome novo vale também nas comandas salvas
- **Tampinhas e níveis:** uma coleção que cresce conforme você usa o app; cada tampinha é um objeto 3D (WebGL) que gira com o dedo; dá para desligar nos Ajustes
- **Sortear alguém da mesa** (em Mais): você escolhe quem entra; um ponteiro gira e para num nome
- **Apresentação na primeira abertura** e **guia** que faz cada passo na tela, do começo ao fim, numa demonstração que não grava nada
- **Sem bebida alcoólica:** nenhum texto, exemplo ou imagem do app fala de bebida alcoólica (há um teste que confere)
- **Use em vários aparelhos (opcional):** histórico e cadastros sincronizados, criptografados, num gist secreto da sua conta GitHub
- **Avaliação e relato de problemas** pelo balão no alto da tela; **presente para o criador** (Pix, opcional)
- Tema claro, escuro ou automático; instalável; funciona sem internet depois da primeira visita

## Como usar

Abra o endereço em qualquer navegador, no celular, no tablet ou no computador. Para instalar:

- **iPhone:** no Safari, toque em **Compartilhar → Adicionar à Tela de Início**
- **Android:** no Chrome, menu **⋮ → Instalar app**
- **Computador:** ícone de instalar na barra de endereço do Chrome ou do Edge

## Onde ficam os dados

| Dado | Onde fica |
|---|---|
| Comanda aberta, histórico, cadastros, preferências e tampinhas | neste aparelho (armazenamento do navegador, chaves `contafacil.*`) |
| Comanda ao vivo (quando você liga) | Firestore do projeto no Firebase (Google), coleção `mesas`; apagada assim que o anfitrião encerra (nunca encerrada: sai na limpeza mensal depois de 30 dias) |
| Histórico e cadastros, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho (AES-256) |
| Avaliações e relatos de problema enviados | Firestore do projeto, coleção `feedback`; apagados depois de 2 anos |

A comanda aberta não vai para a sincronização: para dividir a mesma comanda entre celulares, use a comanda ao vivo.
"Fechada" (em `fechada`), "pago" (com o valor pago por pessoa, em `pagos`) e "já saiu da mesa" (em `saiu`) ficam só no aparelho de quem marcou (não vão para a comanda ao vivo). As tampinhas e os níveis são calculados do
histórico e dos cadastros, então acompanham a sincronização; só as marcas "ao vivo", "sorteio" e "guia" ficam no aparelho.

Quem já usava a versão 0.5.0 não perde nada: as chaves do armazenamento e os formatos são os mesmos.

## Para desenvolver

O app não tem etapa de build nem dependências: o que está no repositório é o que vai para o ar.
O Node (22 ou mais novo) só é usado para o servidor local, os testes e a verificação.

```bash
npm start                         # abre em http://localhost:8080/conta-facil/
npm install                       # primeira vez: instala o Playwright e o axe, usados nos testes
npx playwright install chromium   # primeira vez: baixa o navegador dos testes
npm test                          # testes do Kit Fácil e do app, sem internet
npm run verificar                 # segredos, versão, service worker, CSP e SRI
```

Os testes simulam o GitHub (sincronização) e o Firebase (avaliações); nada toca nos dados reais.
O modo sem internet (service worker) só funciona em `https`, ou seja, no endereço publicado.

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | moldura da página: barra de cima, navegação e a política de segurança (CSP) |
| `estilo.css` | identidade visual (tokens, moldura, telas novas, abertura, festa, tampinhas) |
| `comanda.css` | estrutura da comanda de papel, dos cupons e das janelas |
| `app.js` | motor: modelo, contas em centavos, Pix, cupons, comanda ao vivo, sincronização e a tela da comanda |
| `telas.js` | Início, Histórico, Cadastros e Mais |
| `jogo.js` | níveis, tampinhas e presente em 3D, festa de fechamento e o sorteio |
| `casca.js` | navegação, Ajustes, abertura (onboarding), guia e arranque |
| `fb.js`, `config.js` | conexão com o Firebase da comanda ao vivo |
| `comum/` | **Kit Fácil**: sincronização, avaliação, apoio, cópia de segurança, Ajustes, janelas e avisos. Igual nos quatro apps: não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app |

## Serviços externos e configuração

| Serviço | Para quê | Custo | O que configurar |
|---|---|---|---|
| Firebase (projeto `conta-facil-2c1f9`) | comanda ao vivo (Firestore e login anônimo) e avaliações | plano gratuito | regra de [`comum/regras-firestore-feedback.txt`](comum/regras-firestore-feedback.txt) publicada |
| GitHub (gist) | sincronização entre aparelhos | gratuito | nada no projeto; cada pessoa usa a própria conta |
| Google Fonts, cdnjs, gstatic | fontes, QR code, PDF e biblioteca do Firebase | gratuito | nada |

A configuração web do Firebase em `config.js` é pública por natureza (não é senha); quem protege o banco são as regras do Firestore.

## Publicação

GitHub Pages a partir da branch `main`, pasta raiz. Antes de publicar: `npm run verificar` e os testes da parte que mudou
(regra do Bruno, de 14/11/2026: roda-se só o que a mudança toca, e o relatório diz o que foi pulado). O guia inteiro só roda
quando a mudança mexe no guia; a bateria completa (`npm test`), quando mexe nas contas. Confira o app no celular e no computador,
no claro e no escuro. Se o app abrir com erro no ar, desfaça o envio na hora (`git revert`) e só depois investigue.
O que mudou em cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

## Peças do Kit substituídas (Código, Art. 30-A)

Estão na Proposta 5 para o Integrador; saem daqui quando o Kit as absorver.

| Peça do Kit | O que o app faz por cima | Por quê |
|---|---|---|
| Passo a passo de quantidade (`.kf-quantidade`) | `estilo.css` dá a ele o fundo, o contorno, a altura, a letra e o anel de foco dos campos | no Kit ele tem fundo branco e número em negrito, diferente das outras caixas de texto |
| Pix (`KitFacil.pix`) | `app.js` tem a própria conferência de CPF (`cpfValid`), a validação da chave (`pixErro`) e a chave formatada para leitura (`pixBonita`) | o Kit confere o CPF por dentro, mas não oferece a conta; o app precisava dela para perguntar "CPF ou celular?" |

## Uso do código

O código está público, sem licença de uso definida: todos os direitos reservados.
