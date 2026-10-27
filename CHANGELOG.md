# Mudanças

Formato: versão, data e o que muda para quem usa. Versões no formato `maior.menor.correção`.

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
