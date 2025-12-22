import { Injectable } from '@nestjs/common';
import { User } from '../models/user.entity';
import { DataSource, Equal, FindOptionsWhere, Repository, IsNull, } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Credential } from '@ci/core';
import { createHash } from 'crypto';
import { request } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';
@Injectable()
export class UserService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }
    async registrar(registro: User) {
        return await this.dataSource.transaction(async (manager) => {
            const new_user = this.userRepo.create(registro);
            const user_created = await manager.save(new_user);
            await this.sendEmailConfirmation(user_created);
            return user_created;
        })
    }
    async serdMailTemplate(template_html, message_data?: any) {

    }
    async sendEmailConfirmation(registro: User) {
        return await new Promise<void>((res, rej) => {
            const template_data = {
                ano: null,
                logo_base64: null,
            }
            let data = {
                ano: (new Date()).getFullYear().toString(),
                mail_sender_status: 'Você está recebendo e-mails do Apps.ci.dev.br.',
                nome: registro.fullName,
                mail_confirmation_link: 'https://apps.ci.dev.br/?unsubscrible=zyx',
                apelidio: registro.fullName,
                unsubscrible_link: 'https://apps.ci.dev.br/?unsubscrible=zyx',
                footer_assinatura: 'ci.dev.br - ci.dev.br especialistas em lançamento de aplicativos sob demanda.',
                footer_message: 'ci.dev.br - Sediada em Curitiba, Paraná, Brasil.<br/> Apps é ci.dev.br.',
            };
            let send_mail_request_body = JSON.stringify({
                x: createHash('sha256').update(process.env.mailer_key + '.' + registro.email.trim() + '.apps.ci.dev.br').digest('hex'),
                to: registro.email.trim(),
                from: 'contact@ci.dev.br',
                subject: 'Confirmação de Cadastro',
                message: (() => {
                    let template_html = readFileSync(join(__dirname, '/../', 'templates/mail-template.html')).toString('utf-8');
                    Object.keys(data).forEach(property_name => (template_html = template_html.replaceAll(`{{${property_name}}}`, data[property_name])));
                    return template_html;
                })(),
            });
            let req = request({
                host: 'mailer.xx.app.br',
                port: 443,
                method: 'POST',
                path: '/mailer/send/',
                headers: {
                    'Content-Length': Buffer.byteLength(send_mail_request_body),
                    'Content-type': 'application/json',
                }
            }, (result) => {
                result.on('data', (result_data) => {
                    if (result_data) {
                        console.log(result_data.toString());
                        try {
                            const response_json = JSON.parse(result_data.toString());
                            if (response_json.status !== 200) {
                                rej(new Error('Falha no envio do e-mail de confirmação.\n' + (response_json.message || '')))
                            } else {
                                res();
                            }
                        } catch (e) {

                            rej(new Error('Falha no envio do e-mail de confirmação.\n' + (e?.message || '')))
                        }
                    }
                });
                result.on('end', () => {
                    console.log('No more data in response.');
                });
            });
            req.write(send_mail_request_body);
            req.end();
        });
    }
    async solicitarAcesso(informacaoAcesso: { identificador?: string }) {
    }
    async existsUserByIdentification(identification: string, fator: string) {
        return await this.userRepo.createQueryBuilder('user')
            .where(`encode(sha512(concat(user.username,:fator::varchar)::bytea), 'hex') = :assinatura::varchar`)
            .setParameters(
                {
                    assinatura: identification, fator: fator
                })
            .getOne()
            ;
    }
    async verificarAssinaturaAutenticacao(
        userId: string,
        assinaturaPassword: string,
        chaveAcesso: string,
    ) {
        const user = await this.userRepo.findOne({
            where: { id: Equal(userId), passwordMode: Equal('argon2') }
        });
        if (!!user) {
            if (await argon2.verify(user.password, assinaturaPassword)) {
                delete user.password;
                return user;
            }
        } else {
            return await this.userRepo.createQueryBuilder('user')
                //  .leftJoinAndSelect('user.photo', 'photo')
                .leftJoinAndSelect('user.tenants', 'tenant')
                .where(`"user".id::varchar = :user_id::varchar and encode(sha512(concat(encode(sha512("user".password::bytea),'hex'), :chave_acesso::varchar )::bytea),'hex') = :ass_pass::varchar`)
                .setParameter('user_id', userId)
                .setParameter('ass_pass', assinaturaPassword)
                .setParameter('chave_acesso', chaveAcesso)
                .getOne()
        }
    }
    hashData(data: string) {
        return argon2.hash(data);
    }
    async logout(user: User) {
        return await this.userRepo.update(user.id, {
            refreshToken: null
        })
    }
    async updateRefreshToken(userId: string, refreshToken: string, chave?: Credential) {
        const hashedRefreshToken = await this.hashData(refreshToken);
        return hashedRefreshToken;
        // TODO:  implementar verificação do hash do RefrashToken ...
    }
    async findById(userId: string) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: [/* 'photo',  */
                'tenants',
            ]
        })
        return user;
    }
    /**
     * Sincronizar objeto
     * @param data 
     * @returns 
     */
    async sync(data: User) {
        if (data) {
            delete data.password;
            delete data.refreshToken;
            delete data.tenants;
            delete data.roles;
            delete data.permission;
        }
        let { id, ...changes } = data;
        let data_ref = !!data.id ? await this.userRepo.findOneBy({ id: data.id }) : await this.userRepo.create(data);
        Object.assign(data_ref, changes);
        return await this.userRepo.save(data_ref);
    }
    async find(
        tenants?: string[],
        request?: { user: User }
    ): Promise<User[] | undefined> {
        let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};
        if (!request.user) {
            throw new Error('Acesso negado.');
        }
        if (!!request?.user) {
            if (request.user?.roles?.indexOf('GOODNESS') > -1) {
            } else {
                throw new Error('Acesso negado.');
            }
        }
        return (await this.userRepo.find({
            where: where
        })).map(u => {
            Object.keys(u).forEach(k => {
                if (request.user?.roles?.indexOf('GOODNESS') > -1) {
                    if (['password', 'refreshToken', 'tenants', 'roles', 'permission'].indexOf(k) > -1) {
                        delete u[k]
                    } else if (['internalId', 'id'].indexOf(k) === -1) {
                        if (typeof u[k] === 'string') {
                            u[k] = typeof u[k] === 'string' ? this.ocultaInformacaoSensivel(u[k]) : undefined;
                        }
                    }
                }
            });
            return u;
        }) || undefined;
    }
    ocultaInformacaoSensivel(informacao: string): string {
        if (typeof informacao === 'string' && informacao.length > 4) {
            return informacao.substring(0, 2) + '****' + informacao.substring(informacao.length - 2, informacao.length);
        } else if (typeof informacao === 'string' && informacao.length <= 4) {
            return informacao.substring(0, 1) + '***';
        }
        return informacao;
    }

    async sendInvitation(user: User) {
        return await new Promise<void>((res, rej) => {
            // Implementar envio de convite por e-mail
            res();
        }
        );
    }
}
