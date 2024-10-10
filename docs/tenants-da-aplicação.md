# Tenants da Aplicação

A aplicação segmententa seus dados por Tenants, Usuários, Políticas e Privilégios nesta ordem. Os tenants estão relacionados ao instalador da aplicação. Esse pode ser feita por uma questão técnica ou mesmo organizacional. Por exemplo, o Tenant Raiz é o próprio ci.dev.br que é o tenant que gera todos os tenants derivados. Dessa forma, mesmo que o tenant Raiz senja o gerador dos tenants filhos, esses tem autoridade para decidir o que é privado ou público dentro das estrutúras de dados. 

## Quais usuários podem criar Tenants? 

Os usurios que podem criar tenants devem ser do tipo ADMIN durante toda existência do tenant. O Tenant de origem do usuário criador deve possuir o privilégio de criação de Tenant nas políticas do Tenant origem. Um único usuário pode perterncer a mais de um tenant, então deve indicar obrigatóriamente qual tenant te da direito de criar Tenants.

Tenants podem restringir regiões para seus tenants filiados, até mesmo monetizar recursoso à seu critério.

## Módulos exclusivos

Com o controle sobre tenants é possível importar seu código e criar um módulo de integração de forma simples e conectar os recursos do sistema com seus códigos. Podendo monetizar o uso.

