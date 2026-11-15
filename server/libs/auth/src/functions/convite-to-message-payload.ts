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
    originUrl?: string,
}) => {
    const baseUrl = (registro.originUrl || 'https://apps.ci.dev.br').replace(/\/+$/, '');
    const linkAceitar = `${baseUrl}/registrar/${registro.invite}`;
    return {
        subject: 'Convite para cadastro na plataforma — apps.ci.dev.br',
        template_html: templateHtml('convite-plataforma-template', {
            nome: registro.friendlyName || registro.email,
            mensagem_personalizada: registro.mensagem || 'Conclua seu cadastro para acessar a Loja de Aplicativos e assinar os aplicativos disponíveis para seu perfil.',
            invite_hash: registro.invite,
            link_aceitar_convite: linkAceitar,
            logo_base64: '',
            mail_sender_status: 'Convite oficial enviado pela plataforma apps.ci.dev.br',
            unsubscrible_link: `${baseUrl}/?unsubscribe=${encodeURIComponent(registro.email)}`,
            ano: (new Date()).getFullYear(),
            footer_assinatura: 'ci.dev.br',
            footer_message: 'Apps, seus aplicativos',
        }),
        message_text: `Olá ${registro.friendlyName || registro.email}, você recebeu um convite (hash: ${registro.invite}). Acesse para concluir seu cadastro: ${linkAceitar}`,
        to: registro.email,
        person: null,
        from: null,
        from_person: null,
        need_feedback: null,
        new_report_link: `${baseUrl}/suporte/novo?assunto=Problema%20no%20registro%20de%20conta%20de%20e-mail&mensagem=Descreva%20o%20problema%20encontrado...`,
        act_url: linkAceitar,
    }
}