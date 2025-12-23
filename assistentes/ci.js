const { TheAdjustmentBureau } = require("./the-adjustment-bureau");

let theAdjustmentBureau = new TheAdjustmentBureau();
/**
 * # Orquestrador de processos de CI/CD
 *
 * Este script orquestra a execução de diferentes assistentes de CI/CD,
 * como o The Adjustment Bureau, para automatizar tarefas como verificação
 * de atualizações, análise de código e geração de mensagens de commit.
 *
 * Ele é projetado para ser executado em um loop contínuo, garantindo que
 * o projeto esteja sempre atualizado e em conformidade com as melhores 
 * práticas.
 */
let Try = async () => {
    await theAdjustmentBureau.findUpdate();
    setTimeout(() => {
        Try()
    }, 10000);
}
Try();