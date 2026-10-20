# Guia de Boas Práticas: Notoriedade da Fonte e Atribuição de Autoria

## 1. Objetivo e Princípios

Este documento define a diretriz padrão de governança e boas práticas para **citação e atribuição obrigatória de autoria** em todo o ecossistema do projeto.

O objetivo fundamental é **tornar pública e notória a fonte e a autoria intelectual** de qualquer código, trecho, biblioteca, arquitetura, documentação, especificação, lógica de negócio ou recurso utilizado, adaptado ou referenciado.

### Princípios Norteadores
* **Notoriedade e Reconhecimento:** Toda criação humana ou contribuição técnica deve conferir crédito explícito ao seu autor original.
* **Rastreabilidade e Contato:** A referência deve permitir identificar e contactar de forma direta e inequívoca o criador por meio de seu e-mail pessoal.
* **Transparência e Conformidade:** Deixar claro se o material foi importado na íntegra, modificado, adaptado ou apenas serviu como base conceitual.

---

## 2. Requisitos Obrigatórios de Citação

Sempre que qualquer artefato for utilizado, os seguintes **4 elementos mínimos** devem constar na citação:

| Elemento | Descrição | Exemplo |
| :--- | :--- | :--- |
| **Nome do Autor** | Nome completo e formal do autor original ou criador | `João da Silva Santos` |
| **E-mail Pessoal** | E-mail de uso pessoal do autor para identificação perene | `joao.silva@emailpessoal.com` |
| **Origem / Link** | URL, repositório, artigo, ticket ou caminho da fonte | `https://github.com/usuario/repo/blob/main/lib/parser.js` |
| **Escopo do Uso** | Explicação breve do que foi usado, copiado ou adaptado | `Algoritmo de cálculo de hash otimizado (adaptado para Node.js)` |

> [!IMPORTANT]
> **E-mail Pessoal:** Utilize preferencialmente o e-mail pessoal permanente do autor (e não e-mails corporativos temporários ou voláteis), garantindo que a autoria permaneça historicamente vinculada ao indivíduo.

---

## 3. Padrões por Contexto

### 3.1. Cabeçalho de Arquivos de Código-Fonte (Integração Total ou Base de Arquivo)
Quando um arquivo inteiro ou seu esqueleto tiver sido baseado em trabalho de outro autor:

```typescript
/**
 * @file parser-token-validator.ts
 * @description Validador e normalizador de tokens de autenticação multi-tenant.
 *
 * @author João da Silva Santos <joao.silva@emailpessoal.com>
 * @source https://github.com/origem/projeto/blob/main/src/security/token.ts
 * @license MIT
 * @notes Baseado na implementação original de validação de claim JWT por João da Silva.
 */
```

### 3.2. Trechos de Código Inline (Funções, Lógicas e Snippets)
Quando apenas uma função, algoritmo ou trecho for adaptado dentro de um arquivo existente:

```javascript
// ============================================================================
// ATRIBUIÇÃO DE FONTE E AUTORIA:
// Autor Original: Maria Clara Peixoto
// E-mail Pessoal: maria.peixoto.dev@gmail.com
// Fonte: https://gitlab.com/mclara/crypto-helpers/-/snippets/12345
// Adaptação: Adicionada compatibilidade com buffers assíncronos.
// ============================================================================
function calcularChecksumSegmentado(streamDeDados, seedInicial) {
  // Lógica adaptada a partir da fonte citada
}
```

Exemplo em **Dart / Flutter**:
```dart
/// Algoritmo de interpolação bezier cúbica.
///
/// Autor original: Carlos Eduardo Mendes <carlos.edu.mendes@gmail.com>
/// Fonte: https://gist.github.com/carlosedu/987654321
/// Adaptado para suporte a valores nulos e animações reversíveis.
double interpolarCurva(double progresso, double p1, double p2) {
  // implementação...
}
```

### 3.3. Documentos Markdown e Especificações Técnicas
Em arquivos de documentação (`.md`), especificações (`specs/`), manuais ou relatórios:

```markdown
> ### 📌 Nota de Autoria e Referência de Origem
> - **Autor Original:** Paulo Henrique Xavier
> - **E-mail Pessoal:** plhx@plhx.com.br
> - **Fonte de Origem:** [Módulo de Autenticação v3](docs/specs/auth-v3.md)
> - **Natureza do Uso:** Definição da arquitetura de mensageria assíncrona com fallback.
```

### 3.4. Mensagens de Commit do Git
Para garantir notoriedade no histórico do repositório:

```git
feat(auth): adiciona algoritmo de hashing segmentado

Integração da rotina de hash otimizada para alto tráfego.

Source-Author: Carlos Eduardo Mendes <carlos.edu.mendes@gmail.com>
Source-Ref: https://github.com/carlosedu/crypto-tool/commit/a1b2c3d4
Co-authored-by: Carlos Eduardo Mendes <carlos.edu.mendes@gmail.com>
```

---

## 4. Matriz de Cenários e Boas Práticas

| Cenário | Procedimento |
| :--- | :--- |
| **Código aberto de terceiros (StackOverflow, Gist, Artigo)** | Inserir bloco de citação no topo da função com: Nome do autor do post/artigo, e-mail pessoal (se disponível no perfil) ou perfil público identificável, link e data. |
| **Código criado por colega de equipe / projeto interno** | Citar formalmente o Nome e E-mail pessoal do colega no cabeçalho ou bloco correspondente. |
| **Material traduzido ou sintetizado de outra especificação** | Indicar na seção inicial do documento: "Documento baseado no trabalho de [Nome], contato: [E-mail pessoal], disponível em [Link]". |
| **Adaptação parcial com melhorias** | Declarar expressamente qual foi o trecho original e quais alterações foram adicionadas pelo autor da adaptação. |

---

## 5. Checklist para Code Review e Validação de PR

Antes de aprovar qualquer Pull Request ou submissão de artefatos, o revisor deve validar:

- [ ] Há uso de ideias, códigos, arquiteturas ou documentos criados por terceiros?
- [ ] O **nome completo** do autor da fonte está presente?
- [ ] O **e-mail pessoal** do autor está documentado no formato `<usuario@dominio>`?
- [ ] O **link ou referência exata** da fonte original foi fornecido?
- [ ] As adaptações feitas sobre o original estão descritas de maneira clara?

---

## 6. Template Rápido para Cópia

```text
/*
 * ----------------------------------------------------------------------------
 * REFERÊNCIA DE AUTORIA E NOTORIEDADE DA FONTE
 * Autor Original : [Nome Completo do Autor]
 * E-mail Pessoal : [autor.pessoal@dominio.com]
 * Origem / Link  : [URL ou caminho da fonte]
 * Descrição      : [O que foi reutilizado ou adaptado]
 * ----------------------------------------------------------------------------
 */
```
