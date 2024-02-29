import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Status } from "./model/status";

@Injectable()
export class SystemService {
    constructor(
        @InjectRepository(Status)
        private readonly statusRepo: Repository<Status>,
    ) { }

    async leitura() {
        let processo = await import('process');

        console.log(processo);
        return null;
    }
}