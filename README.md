# Conta Fácil

Divida a conta da mesa sem calculadora: cada um paga o que consumiu, com serviço, couvert, desconto e Pix.

Versão **1.6.1** · Kit Fácil 0.6.0 · app web em <https://brunodecastrosilva.github.io/conta-facil/>

Faz parte do **Projeto Fácil** (Conta Fácil, Elétrica Fácil, Estudo Fácil e Guitarra Fácil). Por decisão do Bruno, de 14/11/2026,
**o Conta Fácil é a referência do Projeto Fácil**: o que foi decidido aqui é regra, não exceção. O
[Código do Projeto Fácil](comum/CODIGO.md) 0.6 já traz essas regras: veja [O novo padrão](#o-novo-padrão).

## O que o app faz

- **Uma comanda só, de papel:** quem está na mesa e quanto paga, os pedidos e o total ficam na mesma folha, montada em tempo real
- **Lançar em uma janela:** produto, quantidade, preço e quem consumiu (compartilhado, entre todos ou entre alguns, ou individual, por unidade)
- **Pessoas:** tocar num nome mostra os atalhos (serviço, couvert, Juntar, Ver cupom e Editar, que muda o nome ou tira da mesa); segurar e arrastar um nome sobre outro junta os dois no mesmo cupom
- **Conta da mesa:** serviço, couvert e desconto em R$ ou em %, e cortesias
- **Pago:** só depois de fechar a comanda: em Fechar a comanda, no cupom de cada pessoa, marque quem já acertou; o app guarda o valor pago e, se a conta mudar depois (desconto, item novo, alguém que chegou), mostra quanto falta ou quanto devolver
- **Fechar a comanda:** um cupom por pessoa (a mesa primeiro), em texto, imagem ou PDF, com Pix copia e cola e QR code; ali também ficam "uma pessoa paga a conta de todos" (cada um continua com o seu cupom), "pagar outro valor" (com a escolha de quem cobre ou devolve a diferença), marcar quem já pagou e "já saiu da mesa" (trava o cupom); salvar tem Desfazer
- **Comanda ao vivo:** cada pessoa marca o que consumiu pelo próprio celular e todos veem as mudanças na hora
- **Histórico:** gasto dos últimos 6 meses, onde você mais vai, com quem mais sai e o que mais sai
- **Cadastros:** pessoas e chaves Pix, turmas (quem sai junto entra na mesa com um toque) e preço de cada produto em cada lugar
- **Tampinhas e níveis:** uma coleção que cresce conforme você usa o app; cada tampinha é um objeto 3D (WebGL) que gira com o dedo; dá para desligar nos Ajustes
- **Sortear alguém da mesa:** você escolhe quem entra; um ponteiro gira e para num nome
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
"Pago" (com o valor pago por pessoa, em `pagos`) e "já saiu da mesa" (em `saiu`) ficam só no aparelho de quem marcou (não vão para a comanda ao vivo). As tampinhas e os níveis são calculados do
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
npm run verificar                 # segredos, versão, service worker, CSP e SRI (duas falhas esperadas: veja O novo padrão)
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

## O novo padrão

Em 14/11/2026 o Bruno definiu que o Conta Fácil, mesmo ainda não finalizado, é o novo padrão do Projeto Fácil: nada do que
está aqui é exceção, e tudo o que foi decidido neste app é regra. No mesmo dia, o Integrador aprovou a
[proposta](PROPOSTA-PARA-O-INTEGRADOR.md) inteira, e o [Código do Projeto Fácil](comum/CODIGO.md) passou à versão 0.6
com essas regras (Art. 93).

Falta só o Kit Fácil 0.7.0 receber as peças que hoje são do app (janelas e teclado, barra de baixo com a comanda no
centro, tela Mais, barra de cima em traço, ícones, presente em 3D, abertura, guia, seções, `comMovimento`, carrossel e
arrastar e soltar; lista no Anexo II, "Peças a levar ao Kit"). Até lá, o app usa as suas próprias peças (Arts. 30-A e
93, § 1º) e `npm run verificar` acusa duas falhas esperadas (barra de cima e Ajustes dentro de Mais).

## Uso do código

O código está público, sem licença de uso definida: todos os direitos reservados.
