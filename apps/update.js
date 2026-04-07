const { execSync } = require('child_process');
function runCommand(command, ignoreErrors = false) {
    console.log(`\n > Executando: ${command}`);
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        if (!ignoreErrors) {
            console.error(`[ERRO CRÍTICO] Falha ao executar: ${command}`);
            process.exit(error.status || 1);
        } else {
            console.warn(`[AVISO] O comando falhou, mas a execução continuará: ${command}`);
            return false;
        }
    }
}
function updateAllPackages() {
    console.log("=== Iniciando Rotina Robusta de Atualização em CI/CD ===");
    runCommand('npm install --legacy-peer-deps');
    runCommand('npx @angular/cli update @angular/core @angular/cli --allow-dirty --force');
    runCommand('npx @angular/cli update @angular/material @angular/cdk --allow-dirty --force', true);
    runCommand('npx @angular/cli update @ngrx/store @ngrx/effects --allow-dirty --force', true);
    runCommand('npm update --legacy-peer-deps');
    runCommand('npm audit fix --force', true);
    console.log("\n=== Atualização concluída com sucesso! ===");
    process.exit(0);
}
updateAllPackages();