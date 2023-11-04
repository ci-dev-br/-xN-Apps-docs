origem: https://bard.google.com/chat/18457a158782fb4e

classDiagram

class Funcionario {
  - nome: String
  - cpf: String
  - rg: String
  - data_nascimento: LocalDate
  - cargo: String
  - salario: BigDecimal

  + cadastrar()
  + atualizar()
  + excluir()
}

class ProLabore {
  - id: Long
  - mes: Int
  - ano: Int
  - valor: BigDecimal

  + gerar()
  + salvar()
  + excluir()
}

class FolhaPagamento {
  - id: Long
  - mes: Int
  - ano: Int
  - valor_bruto: BigDecimal
  - valor_liquido: BigDecimal

  + gerar()
  + salvar()
  + excluir()
}

Funcionario "1" o-- "1..*" ProLabore
Funcionario "1" o-- "1..*" FolhaPagamento