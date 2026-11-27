import { Agendamento } from "./agendamento";
import { Atendimento } from "./atendimento";
import { AtividadeCrm } from "./atividade-crm";
import { CampanhaMarketing } from "./campanha-marketing";
import { ClienteCrm } from "./cliente";
import { HistoricoContato } from "./historico-contato";
import { Oportunidade } from "./oportunidade";
import { Pagamento } from "./pagamento";
import { Produto } from "./produto";
import { Profissional } from "./profissional";
import { Promocao } from "./promocao";
import { Servico } from "./servico";
import { VendaProduto } from "./venda-produto";

export const CrmEntities = [
    Agendamento,
    Atendimento,
    AtividadeCrm,
    CampanhaMarketing,
    ClienteCrm,
    HistoricoContato,
    Oportunidade,
    Pagamento,
    Produto,
    Profissional,
    Promocao,
    Servico,
    VendaProduto,
];

export {
    Agendamento,
    Atendimento,
    AtividadeCrm,
    CampanhaMarketing,
    ClienteCrm,
    HistoricoContato,
    Oportunidade,
    Pagamento,
    Produto,
    Profissional,
    Promocao,
    Servico,
    VendaProduto,
};

export * from './agendamento-status';
export * from './estagio-oportunidade';
export * from './forma-pagamento';
export * from './prioridade-oportunidade';
export * from './status-atividade-crm';
export * from './status-pagamento';
export * from './tipo-atividade-crm';
export * from './tipo-campanha';
export * from './tipo-contato';
