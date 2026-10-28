# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`.

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
