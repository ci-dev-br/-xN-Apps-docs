# Erro de unsuported, pfx não é mais suportado a partir do node 17



Para continuar utilizando pfx em seu sistema, adicione o trecho a seguir em `node_modules/@nestjs/cli/actions/start.action.js:94`:

```
    processArgs.unshift('--openssl-legacy-provider');
```

![img](../Captura%20de%20tela%202024-03-05%20201148.png)
