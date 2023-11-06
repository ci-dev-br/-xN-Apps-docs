# [@CiDevBr/Scructure](), layout dinâmico

 - Criar estruturas de layout baseado em instruções de texto: structure;

O Structure nasce dentro do desenvolvimento de dashboard dinâmicas, onde surge a necessidade em representar estruturas complexas de layout com poucos caracteres, para armazenagem. Ele sempre surgia quando se trata de referenciar a estrutura de layout de forma simples, para que seja simples de armazenar estruturas de layout complexas.

Existem inúmeras formas de representar e descrever layouts. Por isso, será implementado a medida de necessidade de uso. Mantendo em um componente todas as possibilidades de implementação.

O Caractere `-` representa uma divisão entre colunas, em uma separação de cima para baixo. O Numérico representa quantas regiões existem em um nível. Um nível pode ser representados por percentual separado por virgula ou valores inteiros separados por vírgula representando quantos espaços existem na divisão. Nesse exemplo, `2` representa 2 espaços iguais de layout. Com percentual poderia ser representado como: `50%,50%` é a mesma coisa que `2`.  

Descrição de layout por coluna: `1-2-3-4`. Nessa representação cada linha é representada por um número, que descreve quantas divisões

Descrição de layout por coluna e por regiao `ABBD-ACCD-EFGD`, `a-bcd-ef-g+`.

A implementação cruzada entre as regras mas se houver bug é requisito que implemente a situação testada. 

---
_LICENSE: MIT_