# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`.

## 1.8.0 · 2026-10-30

- As listas de escolha (pessoa dos gastos, seu nome nos Ajustes) agora são do próprio app, iguais no iPhone, no
  Android e no computador.
- "Ainda não tenho o app" abre e fecha com o mesmo movimento suave dos outros apps.
- Kit Fácil 2.5.0: lista de escolha do Kit no lugar da lista do sistema e seções que abrem e fecham com movimento
  comum (`KitFacil.escolha`, `KitFacil.secao`, `KitFacil.movimento`).

## 1.7.0 · 2026-10-30

- Janelas com os botões de ação sempre no pé, no mesmo lugar dos outros apps.
- Na comanda do histórico, Abrir para editar e Repetir comanda ficam fixos no pé da janela.
- Kit Fácil 2.4.0: tira partes antigas que nenhum app usava mais (`ajudaHTML`, `kf-marca-compacta`, a opção `topo.html({ ajustes })`).

## 1.6.0 · 2026-10-29

- Todas as telas principais têm título e uma linha dizendo para que servem.
- Listas vazias explicam o que aparece ali e o que fazer, no mesmo formato nos três apps.
- Janelas e avisos iguais aos dos outros apps: o "Desfazer" fica acima da barra de baixo.
- Botões e filtros maiores, mais fáceis de tocar (no mínimo 44 px), e textos pequenos mais legíveis.
- Kit Fácil 2.3.0: cabeçalho de tela, botão de criar, estado vazio, aviso com ação e janela com subtítulo, altura e largura, comuns aos três apps.

## 1.5.0 · 2026-10-29

- Barra de baixo mais limpa: Início, Comanda, Fechar, Histórico e Mais. Cadastros e Ajustes ficam em Mais, com os nomes sempre inteiros.
- Kit Fácil 2.2.0: a barra de baixo tem no máximo 5 posições; com mais seções, as principais e o "Mais".

## 1.4.0 · 2026-10-29

- **Comanda ao vivo apagada ao encerrar:** quando o anfitrião encerra, a comanda sai do Firebase na hora e o link para de funcionar. Para dividir de novo, compartilhe outra vez (código novo). Só o aparelho que criou a comanda consegue apagá-la.
- Comandas nunca encerradas continuam vencendo 30 dias depois de criadas e saem na limpeza mensal.

## 1.3.4 · 2026-10-29

- **Privacidade:** comandas ao vivo ficam guardadas 30 dias depois de encerradas e são apagadas na limpeza mensal seguinte (o plano gratuito do Firebase não permite exclusão automática).

## 1.3.3 · 2026-10-29

- No alto da tela, a nova ordem é nuvem, chopp e balão, com o chopp na mesma cor dos outros ícones.
- A janela do chopp ficou mais simples: um só botão, Copiar código Pix.
- Kit Fácil 2.1.3.

## 1.3.2 · 2026-10-29

- **Prazo de guarda:** Comandas ao vivo agora são apagadas do Firebase 30 dias depois de criadas ou encerradas; avaliações, depois de 2 anos. Veja em Ajustes, Privacidade e segurança.
- Kit Fácil 2.1.2.

## 1.3.1 · 2026-10-29

- **Pague um chopp para o criador!** O chopp passa a aparecer no alto da tela (e em *Sobre o aplicativo*), com QR code e Pix copia e cola. É opcional: o app continua gratuito e igual para todos.
- Kit Fácil 2.1.1.

## 1.3.0 · 2026-10-28

Kit Fácil 2.1, igual nos três apps (Leis Globais v1.5 do Projeto Integrador).

- **Ajustes na barra de baixo:** Ajustes deixa o alto da tela e vira o último item da barra de baixo; no computador, fica no pé do menu lateral. Tocar de novo volta para a lista de guias.
- **Alto da tela:** chopp, nuvem e balão, nessa ordem. O chopp só aparece nas telas principais.
- **Pague um chopp para o criador!** Janela com QR code e Pix copia e cola, também em *Sobre o aplicativo*. É opcional: o app continua gratuito e igual para todos. O ícone aparece quando a chave Pix do criador for cadastrada no Kit.
- **Novidades:** depois de cada atualização, o app mostra uma vez o que mudou; a lista fica em *Sobre o aplicativo*.
- **Boas-vindas:** quem abre o app pela primeira vez vê os três primeiros passos e o atalho para o exemplo guiado.
- **Correção:** o manifesto agora tem identidade própria (`/conta-facil/`). Antes, o Chrome podia achar que o Conta Fácil já estava instalado quando outro app da família estava. Quem já instalou o app pode precisar instalar de novo.

## 1.2.0 · 2026-10-27

Padronização da interface e dos Ajustes com o Elétrica Fácil e o Estudo Fácil (Kit Fácil 2).

- **Alto da tela:** Ajustes, a **nuvem** e o **balão** ficam no canto direito, iguais nos três apps.
  A nuvem mostra o estado real da sincronização (sincronizado, sincronizando, pendente, erro, sem internet ou desligada);
  tocar nela mostra a conta, a última sincronização e as ações.
- **Balão:** escolha entre **Avaliar o app** (nota de 1 a 5 e comentário opcional) e **Relatar um problema**
  (descrição, com categoria e gravidade opcionais).
- **Navegação:** as abas saíram do topo e foram para a barra de baixo no celular e no tablet; no computador viram um menu lateral.
- **Ajustes em guias:** as oito guias comuns da família, na mesma ordem dos outros apps, e a guia **Comandas**.
  No computador, a lista e a guia aberta ficam lado a lado. "Você nas comandas" foi para Conta e perfil.
- **Privacidade e segurança:** novo botão para apagar os dados deste aparelho (não mexe na nuvem).
- **Fonte comum da família** (Atkinson Hyperlegible, feita para leitura fácil); o cupom continua com a fonte de impressora.
- O indicador antigo do topo ("só neste aparelho" / "comanda ao vivo") deu lugar à nuvem; o estado da comanda ao vivo
  continua no painel da própria comanda e na guia Ajustes → Comandas.
- A cópia de segurança antiga (1.1.0) continua sendo aceita na restauração.

## 1.1.0 · 2026-10-26

Adequação às diretrizes do Projeto Integrador.

- **Usar em vários aparelhos:** o histórico e os cadastros (pessoas, chaves Pix e preços por local) agora podem
  sincronizar entre celular, tablet e computador, criptografados num gist secreto da conta GitHub de quem usa.
  A comanda aberta continua no aparelho (para várias pessoas usarem a mesma comanda, existe a comanda ao vivo).
- **Ajustes:** nova tela, no botão do topo, com sincronização, aparência, cópia de segurança, avaliação e instalação.
- **Avaliar o app e relatar problemas:** formulário padrão do projeto (nota, tipo, mensagem e contato opcional),
  com fila no aparelho quando estiver sem internet.
- **Sobre e privacidade:** versão do app, onde ficam os dados e os outros apps do projeto.
- **Aparência:** tema claro, escuro ou automático.
- **Cópia de segurança:** baixar e restaurar o histórico e os cadastros num arquivo.
- **Acessibilidade:** o zoom com dois dedos voltou a funcionar e a página declara o idioma (pt-BR) para leitores de tela.
- O topo mostra se os dados estão só no aparelho, sincronizados ou na comanda ao vivo.
- Para quem desenvolve: Kit Fácil em `comum/`, `npm start`, `npm test` (testes automáticos no navegador),
  `npm run verificar`, README e este histórico.

## 1.0.0

Versão anterior à numeração: comanda, divisão por item, fechamento com serviço, couvert, desconto e Pix,
comanda ao vivo, histórico com estatísticas, cadastros e uso sem internet.
