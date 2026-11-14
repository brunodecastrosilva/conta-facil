# Conta Fácil

Divida a conta do bar ou do restaurante sem calculadora: cada um paga o que consumiu, com serviço, couvert, desconto e Pix.

Versão **1.0.0** · Kit Fácil 0.6.0 · app web em <https://brunodecastrosilva.github.io/conta-facil/>

Faz parte do **Projeto Fácil** (Conta Fácil, Elétrica Fácil, Estudo Fácil e Guitarra Fácil). A versão 1.0 foi refeita com liberdade
para sair do [Código do Projeto Fácil](comum/CODIGO.md); o que saiu e o porquê está em [Exceções ao padrão](#exceções-ao-padrão).

## O que o app faz

- **Uma comanda só, de papel:** quem está na mesa e quanto paga, os pedidos e o total ficam na mesma folha, montada em tempo real
- **Lançar em uma janela:** produto, quantidade, preço e quem consumiu (compartilhado, entre todos ou entre alguns, ou individual, por unidade)
- **Pessoas:** tocar num nome mostra os atalhos; segurar e arrastar um nome sobre outro junta os dois no mesmo cupom
- **Conta da mesa:** serviço, couvert e desconto em R$ ou em %, cortesias e "uma pessoa paga a conta de todos"
- **Pago:** marque quem já acertou; o alto da comanda mostra quanto falta
- **Fechar a comanda:** um cupom por pessoa (a mesa primeiro), em texto, imagem ou PDF, com Pix copia e cola e QR code; salvar tem Desfazer
- **Comanda ao vivo:** cada pessoa marca o que consumiu pelo próprio celular e todos veem as mudanças na hora
- **Histórico:** gasto dos últimos 6 meses, onde você mais vai, com quem mais sai e o que mais sai
- **Cadastros:** pessoas e chaves Pix, turmas (quem sai junto entra na mesa com um toque) e preço de cada produto em cada lugar
- **Tampinhas e níveis:** uma coleção que cresce conforme você usa o app; dá para desligar nos Ajustes
- **Girar a garrafa:** sorteia alguém da mesa
- **Apresentação na primeira abertura** e **guia** que mostra cada passo na tela, numa demonstração que não salva nada
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
"Pago" fica só no aparelho de quem marcou (não vai para a comanda ao vivo). As tampinhas e os níveis são calculados do
histórico e dos cadastros, então acompanham a sincronização; só as marcas "ao vivo", "garrafa" e "guia" ficam no aparelho.

Quem já usava a versão 0.5.0 não perde nada: as chaves do armazenamento e os formatos são os mesmos.

## Para desenvolver

O app não tem etapa de build nem dependências: o que está no repositório é o que vai para o ar.
O Node (22 ou mais novo) só é usado para o servidor local, os testes e a verificação.

```bash
npm start                         # abre em http://localhost:8080/conta-facil/
npm install                       # primeira vez: instala o Playwright e o axe, usados nos testes
npx playwright install chromium   # primeira vez: baixa o navegador dos testes
npm test                          # testes do Kit Fácil e do app, sem internet
npm run verificar                 # segredos, versão, service worker, CSP e SRI (veja as exceções abaixo)
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
| `jogo.js` | níveis, tampinhas, festa de fechamento e a garrafa |
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

GitHub Pages a partir da branch `main`, pasta raiz. Antes de publicar: `npm test`, e confira o app no celular e no computador,
no claro e no escuro. Se o app abrir com erro no ar, desfaça o envio na hora (`git revert`) e só depois investigue.
O que mudou em cada versão está no [`CHANGELOG.md`](CHANGELOG.md).

## Exceções ao padrão

A versão 1.0.0 foi pedida pelo Bruno em 14/11/2026 com liberdade para ignorar o Código do Projeto Fácil. Esta é a lista do que
saiu do Código (versão 0.5) e das Regras do Conta Fácil, e por quê. Falta registrar no Painel do Integrador (Código, Art. 5º).

| Regra | O que foi feito | Por quê |
|---|---|---|
| Arts. 59 e 60 (navegação) e Regras, Art. 10 | barra flutuante com a comanda no centro; "Mais" é uma tela, e os Ajustes ficam dentro dela (no computador, no pé do trilho) | a comanda é a ação principal da noite e fica sempre sob o polegar; cinco destinos sem encolher os nomes |
| Art. 64, II (um só jeito de criar) | a comanda nova nasce no Início e no botão do centro da barra | o botão do centro vale em qualquer tela; o campo do Início serve a quem acabou de abrir o app |
| Art. 65 (componentes do Kit) | carrossel dos cupons, arrastar e soltar e seções da comanda são do app; Cadastros usa segmento no lugar das guias | são as peças afinadas no Laboratório, dentro do papel; trocá-las mudaria o comportamento já testado |
| Art. 66 (uma cor de botão principal) | verde para a ação principal e âmbar para abrir comanda e girar a garrafa | o âmbar (chopp) marca o começo da noite e dá identidade; os dois têm contraste AA |
| Art. 67 (nada lado a lado) | tiras das últimas comandas, grade de tampinhas e três pódios lado a lado no computador | são coleções para ver de relance, não dados para comparar linha a linha |
| Art. 68 (janelas e avisos só do Kit) | a abertura e a festa de fechamento são telas cheias do app | momentos de marca, com animação própria; foco preso, Esc e leitor de tela tratados |
| Art. 72 (movimento só do Kit) | impressora, tampinha em 3D, confete, carimbo e garrafa têm animação própria | pedido de app interativo e gamificado; movimento reduzido é respeitado em todas |
| Arts. 75 e 76 (sem tela de primeiro uso; janela a cada abertura) | abertura de quatro telas, uma vez só, com Pular | pedido expresso de um onboarding; a janela a cada abertura cansava |
| Arts. 77 a 79 (guia em dois níveis) | um guia só, em vídeo, refeito para as telas novas | mantém a exceção aprovada em 09/11/2026 |
| Anexo II (o app não redefine os tokens do Kit) | cantos maiores e altura da navegação redefinidos; títulos em Bricolage Grotesque | identidade própria; a fonte de caráter nos títulos é permitida pelo Art. 56, IV |
| Art. 22 (versão 0.x na fase de testes) | versão 1.0.0 | pedido de app pronto para a publicação oficial |
| Art. 24 (publicar direto na `main`) | a 1.0.0 passou primeiro por um ramo (`claude/conta-facil-novo`) e foi para a `main` em 14/11/2026, a pedido do Bruno | troca grande demais para ir ao ar sem aviso |
| Arts. 82, 84, 85 e 87 (perguntar antes, opções com desenho, textos só com "sim") | decisões de desenho e de texto tomadas sem perguntar | pedido de liberdade criativa total |
| Anexo VII (testes comuns da moldura) | `npm test` roda os testes do Kit e os do app; a varredura de acessibilidade do Kit foi trocada por `tests/acessibilidade.test.mjs` | a varredura do Kit procura os Ajustes na barra do Kit, que mudou |
| Regras, Art. 5º, parágrafo único (item novo no topo) | o item novo entra no fim da lista | fica ao lado do botão de lançar, como no Laboratório |
| Regras, Arts. 6º e 7º (telas Fechar e Pagamento) | Fechar faz parte da comanda; o pagamento fica nos atalhos de cada pessoa e na conta da mesa | conceito do Laboratório: uma folha só |

Continuam valendo, sem exceção: gratuidade (Art. 12), convite de apoio (Art. 13), português do Brasil (Art. 14), acessibilidade
(Art. 16), repositório sem segredos e sem build (Arts. 19 e 21), dados no aparelho e sincronização opcional (Arts. 32 a 37),
prazos de guarda (Art. 39), segurança (Arts. 43 a 50: CSP sem script na página, SRI, texto de fora sempre protegido), avaliação
(Arts. 51 a 54), modo escuro e pasta `comum/` intacta (Art. 30).

## Uso do código

O código está público, sem licença de uso definida: todos os direitos reservados.
