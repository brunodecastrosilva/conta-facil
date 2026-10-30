# Conta Fácil

Divida a comanda do bar ou do restaurante sem calculadora: cada um paga o que consumiu, com serviço, couvert, desconto e Pix.

**Fase de testes** · versão 1.6.0 · app web em <https://brunodecastrosilva.github.io/conta-facil/>

Faz parte do **Projeto Integrador** (Conta Fácil, Elétrica Fácil e Estudo Fácil) e segue o padrão comum descrito em
[`comum/PADRAO.md`](comum/PADRAO.md).

## O que o app faz

- Abra uma comanda com o nome do local; os lugares onde você já foi viram atalhos
- Lance os pedidos e divida cada item igualmente ou por unidade, com cortesias, couvert, desconto e taxa de serviço (percentual ou valor fixo)
- Feche a conta: quanto cada um paga, quem paga por quem, cupons em imagem, PDF ou texto e Pix copia e cola com QR code
- **Comanda ao vivo:** cada pessoa marca o que consumiu pelo próprio celular e todos veem as mudanças na hora
- Histórico com estatísticas e cadastros de pessoas, chaves Pix e preços de cada produto em cada local
- **Use em vários aparelhos (opcional):** histórico e cadastros sincronizados, criptografados, num gist secreto da sua conta GitHub
- **Avalie o app e relate problemas** pelo balão no alto da tela (ou em Ajustes → Avaliação e feedback)
- **Nuvem no alto da tela:** mostra se os dados estão sincronizados, sincronizando, pendentes, com erro ou sem internet
- **Barra de baixo com no máximo 5 posições:** as seções principais e "Mais", com o resto e os Ajustes (no computador, tudo no menu lateral)
- **Pague um chopp para o criador!** O app é gratuito; o chopp no alto da tela, entre a nuvem e o balão, abre o Pix (QR code e copia e cola), se você quiser apoiar
- **Novidades:** depois de cada atualização, o app mostra uma vez o que mudou
- Tema claro, escuro ou automático; funciona sem internet depois da primeira visita
- Comanda de exemplo com um guia que mostra cada função

## Como usar

Abra o endereço em qualquer navegador, no celular, no tablet ou no computador. Para instalar:

- **iPhone:** no Safari, toque em **Compartilhar → Adicionar à Tela de Início**
- **Android:** no Chrome, menu **⋮ → Instalar app**
- **Computador:** ícone de instalar na barra de endereço do Chrome ou do Edge

## Onde ficam os dados

| Dado | Onde fica |
|---|---|
| Comanda aberta, histórico, cadastros e preferências | neste aparelho (armazenamento do navegador, chaves `contafacil.*`) |
| Comanda ao vivo (quando você liga) | Firestore do projeto no Firebase (Google), coleção `mesas`; apagada assim que o anfitrião encerra (nunca encerrada: sai na limpeza mensal depois de 30 dias) |
| Histórico e cadastros, com a sincronização ligada | gist secreto na conta GitHub do usuário, criptografado no aparelho (AES-256) |
| Avaliações e relatos de problema enviados | Firestore do projeto, coleção `feedback`; apagados depois de 2 anos |

A comanda aberta não vai para a sincronização: para dividir a mesma comanda entre celulares, use a comanda ao vivo.
A guia **Ajustes → Privacidade e segurança** explica isso para quem usa o app.

## Para desenvolver

O app não tem etapa de build nem dependências: o que está no repositório é o que vai para o ar.
O Node (22 ou mais novo) só é usado para o servidor local, os testes e a verificação do padrão.

```bash
npm start                         # abre em http://localhost:8080/conta-facil/
npm install                       # primeira vez: instala o Playwright, usado nos testes
npx playwright install chromium   # primeira vez: baixa o navegador dos testes
npm test                          # testes do Kit Fácil e do app, sem internet
npm run verificar                 # padrão do Projeto Integrador, segredos e versão
```

Os testes simulam o GitHub (sincronização) e o Firebase (avaliações); nada toca nos dados reais.
O modo sem internet (service worker) só funciona em `https`, ou seja, no endereço publicado.

## Interface

Segue o padrão comum da família (veja [`comum/PADRAO.md`](comum/PADRAO.md)):

- **Alto da tela, à direita:** Ajustes, nuvem da sincronização e balão de avaliação, nessa ordem
- **Navegação:** barra embaixo no celular e no tablet; menu lateral no computador (a partir de 1024 px)
- **Ajustes:** as oito guias comuns (Conta e perfil, Sincronização e armazenamento, Aparência, Preferências gerais,
  Notificações, Privacidade e segurança, Avaliação e feedback, Sobre o aplicativo) e a guia própria **Comandas**
  (comanda ao vivo, guia do app e atalho para os Cadastros). "Você nas comandas" fica em Conta e perfil.

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | o app inteiro: estrutura, estilo e código |
| `fb.js`, `config.js` | conexão com o Firebase da comanda ao vivo |
| `comum/` | **Kit Fácil**: sistema de design comum, barra superior, Ajustes, avaliação, sincronização e o padrão do projeto. Igual nos três apps: não edite só aqui |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso sem internet |
| `tests/` | testes do app |

## Serviços externos e configuração

| Serviço | Para quê | Custo | O que configurar |
|---|---|---|---|
| Firebase (projeto `conta-facil-2c1f9`) | comanda ao vivo (Firestore e login anônimo) e avaliações | plano gratuito | publicar a regra de [`comum/regras-firestore-feedback.txt`](comum/regras-firestore-feedback.txt) para as avaliações chegarem |
| GitHub (gist) | sincronização entre aparelhos | gratuito | nada no projeto; cada pessoa usa a própria conta |
| Google Fonts, cdnjs, gstatic | fontes, QR code, PDF e biblioteca do Firebase | gratuito | nada |

A configuração web do Firebase em `config.js` é pública por natureza (não é senha); quem protege o banco são as regras do Firestore.
Recomendado restringir a chave por referenciador no Google Cloud (veja o `PADRAO.md`, item 9).

## Publicação

GitHub Pages a partir da branch `main`, pasta raiz. Antes de publicar: `npm run verificar` e `npm test`, e confira o app
no celular e no computador. O que mudou em cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

## Uso do código

O código está público durante a fase de testes, sem licença de uso definida: todos os direitos reservados.
