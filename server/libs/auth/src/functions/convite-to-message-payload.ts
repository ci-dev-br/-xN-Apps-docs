import { templateHtml } from "@ci/core/template/load-template.fn";

/**
 * Converte os dados de convite em um payload para envio de mensagem.
 * @param registro 
 * @returns 
 */
export const conviteToMessagePayload = (registro: {
    email: string,
    friendlyName: string,
    mensagem: string,
    invite: string,
}) => {
    // const register_id = createHash('sha256').update(`${registro.internalId}${registro.email}`).digest('hex').toString();
    return {
        template_html: templateHtml('convite-plataforma-template', {
            nome: registro.friendlyName,
            link_aceitar_convite: 'https://apps.ci.dev.br/registrar/' + registro.invite,
            logo_base64: '',
            ano: (new Date()).getFullYear(),
            footer_assinatura: 'ci.dev.br',
            footer_message: 'Apps, seus aplicativos',
        }),
        message_text: null,
        to: registro.email,
        person: null,
        from: null,
        from_person: null,
        need_feedback: null,
        new_report_link: `https://apps.ci.dev.br/suporte/novo?assunto=Problema%20no%20registro%20de%20conta%20de%20e-mail%20${0}&mensagem=Descreva%20o%20problema%20encontrado...`,
        act_url: `https://apps.ci.dev.br/registro/${registro.invite}`,
    }
}