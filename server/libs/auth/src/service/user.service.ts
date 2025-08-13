import { Injectable } from '@nestjs/common';
import { User } from '../models/user.entity';
import { DataSource, Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { ChaveAcesso } from '@ci/core';
import { createHash } from 'crypto';
import { request } from 'https';
import { readFileSync } from 'fs';
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
    async sendEmailConfirmation(registro: User) {
        return await new Promise<void>((res, rej) => {
            const template_data = {
                ano: null,
                logo_base64: null,
            }
            let send_mail_request_body = JSON.stringify({
                x: createHash('sha256').update(process.env.mailer_key + '.' + registro.email.trim() + '.apps.ci.dev.br').digest('hex'),
                to: registro.email.trim(),
                from: 'contact@ci.dev.br',
                subject: 'Confirmação de Cadastro',
                message: readFileSync(__dirname + '/../templates/mail-template.html').toString('utf-8')
                    .replaceAll('::ano::', (new Date()).getFullYear().toString())
                    .replaceAll('::mail_sender_status::', 'Você está recebendo e-mails do Apps.ci.dev.br.')
                    .replaceAll('::nome::', registro.fullName)
                    .replaceAll('::mail_confirmation_link::', 'https://xx.app.br/confirmation/')
                    .replaceAll('::apelidio::', registro.fullName)
                ,
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
    async updateRefreshToken(userId: string, refreshToken: string, chave?: ChaveAcesso) {
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
    ): Promise<User[] | undefined> {
        return await this.userRepo.find({
            where: {
                // tenants:
                // id: ''
            }
        }) || undefined;
    }
}
