import { Injectable } from "@nestjs/common";
import { Server } from "../model/server.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
@Injectable()
export class ServerService {
    constructor(
        @InjectRepository(Server)
        private readonly userRepo: Repository<Server>,
    ) { }
    /**
     * Registra servidor na base interna
     */
    async registrar() {
        /* 
        Reegistrar serviço de mirror para espelhamento de rede e cache para seriços de terceiros na rede interna
        */
    }
}