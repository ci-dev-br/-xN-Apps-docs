# Controle de Execução na camada 1 antes de iniciar

Na camada 1, é compartilhado um arquivo `STATUS` ao qual contém as aplicações em execução. E a situação de cada execução. Este arquivo permite um controle antes da aplicação ser carregada em memória, evitando alocar recursos sem necessidade.

Esta etapa não subtitui o controle na camada 8. Apenas evita desgastes em uso desnecessário de recursos.

Ele permite que aplicações sejam executadas mais de uma vez em paralelo, distribuindo a carga dinamicamente entre os clientes da aplicação. 