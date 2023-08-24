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
}
