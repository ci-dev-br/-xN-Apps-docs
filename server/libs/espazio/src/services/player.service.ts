import { Repository } from "typeorm";
import { EzPlayer } from "../model/ez-player.entity";
import { InjectRepository } from "@nestjs/typeorm";

export class PlayerService {

    constructor(
        @InjectRepository(EzPlayer)
        private readonly repo: Repository<EzPlayer>,
    ) { }

    async create(id: string) {
        const novo = this.repo.create({ publicPlayerName: id });

        return await this.repo.save(novo);
    }
}