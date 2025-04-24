import { Injectable } from "@nestjs/common";
const Imap = require('imap');
import { inspect } from "util";
@Injectable()
export class MailService {
    private tentativas = 0;
    private imap?: any;
    private openInbox(cb) {
        this.imap?.openBox('INBOX', false, cb);
    }
    private async readyHandler(REGX?: RegExp) {
        return await new Promise<any>((res, rej) => {
            this.imap.once('ready', () => {
                this.openInbox((err, box) => {
                    if (err) throw err;
                    try {
                        this.imap.search(['UNSEEN', ['SUBJECT', 'Iniciar sessão no Character.AI']], async (err, results) => {
                            if (err) return;
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
            this.imap.once('error', (err) => {
                console.trace(err);
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
}