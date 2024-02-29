import { Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Tenant } from 'src/tenant/models/tenant.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

    ) { }
    async registrar(registro: User) {
        const new_user = this.userRepo.create(registro);
        return await this.userRepo.save(new_user);
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
        return await this.userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.photo', 'photo')
            .leftJoinAndSelect('user.tenants', 'tenant')
            .where(`"user".id::varchar = :user_id::varchar and encode(sha512(concat(encode(sha512("user".password::bytea),'hex'), :chave_acesso::varchar )::bytea),'hex') = :ass_pass::varchar`)
            .setParameter('user_id', userId)
            .setParameter('ass_pass', assinaturaPassword)
            .setParameter('chave_acesso', chaveAcesso)
            .getOne()
    }
    hashData(data: string) {
        return argon2.hash(data);
    }
    async logout(user: User) {
        return await this.userRepo.update(user.id, {
            refreshToken: null
        })
    }
    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await this.hashData(refreshToken);
        await this.userRepo.update(userId, {
            refreshToken: hashedRefreshToken
        })
    }
    async findById(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['photo', 'tenants'] })
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
}
