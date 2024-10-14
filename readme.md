# Portal Manager Applications
[Colaboradores](./docs/colaboradores.md) | [Documentação](./docs/colaboradores.md) | [Sobre]()

 [Portal](https://apps.ci.dev.br:446/) | [git](https://101.ci.dev.br:444/git/Repository/Detail/94e95210-26d3-4884-a691-0fb9ddbfccda) | [jira]() | [Bibliotecas]() | [Recursos Adicionais]() | [Serviços]()

Portal Manager Applications é uma solução simples para construção de sistemas integrados multi-plataforma e de infra-estrutura híbrida pronta para atender qualquer projeto de aplicativo ou sistema. Podendo ser instalado na web ou em sua intranet de forma simples e descomplicada. 

O código é escrito em um alto nível de abstração sintática. Com camadas para qualquer usuário conseguir customizar seus Módulos operacionais. Desenvolvido com Angular, NestJS e PostgreSQL e PostGIS, com possibilidade de substituir os módulos por outras tecnologias que possam cumprir a função. 

---

# Iniciando instalação

Para instalar o projeto localmente você precisa ter o NodeJS instalado em sua máquina. Se deseja criar um banco de dados é necessária ter acesso ao banco a partir da máquina que executará a aplicação. As bases são instaladas de acordo com o modelo de dados estruturados anteriormente.

---
Obrigado pela preferência em utilizar do meu código, fito com ♥

---
---

# ci.dev.br, Apps - Workspaces

Apps é uma solução integrada de várias tecnologias que permitem disponibilizar de forma simple um sistema leve e robusto que permita a construção de Aplicações Híbridas Locais e em Núvem multi-plataforma. Apps não é um Framework, mas sim um Bolerplate de Caso de Uso de Diversos conjuntos de Frameworks escolhidos a dedo.

Objetivo:
Disponibilizar uma aplicação multi-plataforma sem custo adicional.
---


Para executar a aplicação instale as dependências do projeto com `npm install` .

---

0. Pré-requisitos:

Instalar a versão mais recente LTS do projeto NodeJS. Antes disso é importante que você entenda o que é o NodeJS. Para isso, acesse o seu site oficial na internet e leia um pouco sobre. Se sentir confortável, instale o NodeJS. Agora com o NodeJS instalado, instale o NPM, NestJS CLI, Nodemon, E o Angluar CLI. Para isso, encontre o site oficial de cada projeto e instale por conta.

Agora com seu ambiente correetamente configurado podemos começar.

1. Instalândo as dependências do projeto

```
npm install
```

2. Executando Aplicação

```
cd server
nest start --watch --debug
```

As flags debug e watch são opcionais. Watch permite que o código seja executado toda fez que os fontes forem atualizados. Esta é a configuração padrão para Insiders. Garantindo que o código seja atualizado corretamente. Já a flag debug permite que o seu Nó de execução seja depurado. Permitindo gerar relatórios para análise. Desligue esta flag se não quiser que seu nó gere relatórios. 

---

O projeto deve atualizar sozinho corretamente. Porém pode ser que ocorram falhas durante a execução. Para reiniciar basta sempre iniciar `nest start --watch --debug`. Caso não consiga resolver por conta, escreva um e-mail para [E-mail](mailto://report@ci.dev.br) explicando o prooblema. Responderemos o mais breve para re-estabelecer sua aplicação.

----


## Links 

    1. Documentação; 
    2. Instalação;
    2.1. Habilitando HTTPS na sua aplicação;
    2.2. Instalando o baco de dados.
    2.2.1. Habilitando Banco do nó como Postgres.
    2.2.1.2 Habilitando PostGIS Necessário para cálculos geodésico.
    2.2.2. Habilitando Banco do nó como MySQL.
    2.2.3. Habilitando Banco do nó como arquivo SQLLite.
    2.2.4. Habilitando Banco do nó como arquivo SQL Server.
    3. Habilitando Servço SMTP na sua aplicação;



---
CiDevBr - Todos os Direitos Reservados - 1993 - 2024