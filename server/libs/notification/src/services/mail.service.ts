import { Pessoa } from "@ci/cadastro";
import { Injectable } from "@nestjs/common";
const Imap = require('imap');
import { inspect } from "util";
import { MessageService } from "./message.service";
import { request } from "https";
import { hashMailer } from "../hash-mailer";
@Injectable()
export class MailService {
    constructor(
        private readonly messages: MessageService,
    ) { }
    private tentativas = 0;
    private imap?: any;
    private openInbox(cb) {
        this.imap?.openBox('INBOX', false, cb);
    }
    private async readyHandler(REGX?: RegExp) {
        return await new Promise<any>((res, rej) => {
            this.imap.once('ready', () => {
                this.openInbox((error, box) => {
                    if (error) throw error;
                    try {
                        this.imap.search(['UNSEEN',
                            ['SUBJECT', 'Iniciar sessão no Character.AI']
                        ], async (error, results) => {
                            if (error) return;
                            results;
                            if (results.length > 0) {
                                res(await this.fetchHandler(this.imap.fetch(results, { bodies: '1', markSeen: true }), REGX));
                            } else {
                                rej();
                            }
                        });
                    } catch (error) {
                        console.trace(error);
                    }
                });
            });
            this.imap.once('error', (error) => {
                console.trace(error);
            });
            this.imap.once('end', () => {
                console.log('Connection ended');
            });
        });
    }
    private async fetchHandler(fetch, REGX?: RegExp) {
        return await new Promise<any>((res, rej) => {
            fetch.on('message', (msg, seqno) => {
                console.log('Message #%d' + seqno);
                console.log('Message type' + msg.text)
                let prefix = '(#' + seqno + ') ';
                let buffer = '';
                let body = '';
                msg.on('body', (stream, info) => {
                    stream.on('data', (chunk) => {
                        buffer += chunk.toString('utf8');
                        // console.log("BUFFER" + buffer)
                        body += chunk.toString('utf8');
                    })
                    stream.once('end', () => {
                        if (info.which === '1') {
                            // console.log("BUFFER" + buffer)
                        }
                        if (REGX) {
                            let a = REGX.exec(body);
                            if (a && a[0]) {
                                res(a[1]);
                            } else {
                                res(null);
                            }
                        } else {
                            res(null);
                        }
                    });
                    // console.log(prefix + 'Body');
                    // stream.pipe(createWriteStream('msg-' + seqno + '-body.txt'));
                    /// (https:\/\/character\.ai\/login\/[.*\w\W]{0,})<\/code
                });
                msg.once('attributes', (attrs) => {
                    console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                });
                msg.once('end', () => {
                    console.log(prefix + 'Finished');
                });
            });
            fetch.once('error', (err) => {
                console.log('Fetch error: ' + err);
            });
            fetch.once('end', () => {
                console.log('Done fetching all messages!');
                this.imap.end();
            });
        });
    }
    async readMail(REGX?: RegExp) {
        return new Promise<string>(async (res, rej) => {
            try {
                // TODO:  adicionar contas de e-mail vinculadas ao tenant.

                this.imap = new Imap({
                    // user: 'allana.santos@ci.dev.br',
                    // password: '21x3$N&*KhEC%¨g¨&j*ilK(0ç0-*34f5g6h',
                    // host: 'mail.ci.dev.br',
                    // port: 143 /* 993 */,
                    // tls: false,
                    // mailbox: "INBOX"
                });
                try {
                    res(await this.readyHandler(REGX));
                } catch (error) {
                    rej();
                }
                this.imap.connect();
            } catch (error) {
                console.trace(error);
            }
        });
    }
    /**
     * Registry message to sent by mail. 
     * Este serviço visa garantir o envio e entrega do e-mail 
     * com retorno imediato do evento. Tendo uma abordame mista
     * para captura do evento de retorno do usuário. 
     * @param message 
     */
    public requestSendMessageToMail(message: {
        template_html?: string,
        message_text?: string,
        to?: string,
        person?: Pessoa,
        from?: string,
        subject?: string,
        from_person?: Pessoa,
        need_feedback?: boolean,
    }) {
        return new Promise<void>((resulte, reject) => {
            const x_hash = hashMailer(message.to);
            const mail_payload = {
                x_hash,
                content_payload: {
                    from: 'apps@ci.dev.br',
                    to: message.to,
                    subject: message.subject || 'apps.ci.dev.br, sua plataforma de Aplicativos',
                    message_html: message.template_html || message.message_text,
                    content_type: 'text/html;charset=UTF-8'
                },
                action: 'send_mail_message'
            };
            const req = request({
                hostname: process.env.CI_APPS_MAILER_HOSTNAME,
                path: '/mailer/br.dev.ci.apps/index.php',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            }, (r) => {
                r.on('data', (data) => {
                    let result;
                    console.log(data.toString());
                    try {
                        result = JSON.parse(data);
                    } catch (error) {
                        console.trace(error);
                    }
                    if (result?.code === 0)
                        resulte(result);
                    else {
                        reject(new Error('Falha no envio do e-mail.\n' + (result?.message || '')));
                    }
                });
            });
            req.write(JSON.stringify(mail_payload));
            req.end();
        });
    }
}  