import { Inject, Injectable } from '@nestjs/common';
import { User } from '../models/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
            .setParameters({ assinatura: identification, fator: fator })
            .getOne();
    }
    async verificarAssinaturaAutenticacao(
        userId: string,
        assinaturaPassword: string,
        chaveAcesso: string,
    ) {
        return await this.userRepo.createQueryBuilder('user')
            .where(`"user".id::varchar = :user_id::varchar and encode(sha512(concat(encode(sha512("user".password::bytea),'hex'), :chave_acesso::varchar )::bytea),'hex') = :ass_pass::varchar`)
            .setParameter('user_id', userId)
            .setParameter('ass_pass', assinaturaPassword)
            .setParameter('chave_acesso', chaveAcesso)
            .getOne()
    }
}
