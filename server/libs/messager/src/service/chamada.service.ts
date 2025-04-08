import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Chamada } from "../model/chamada.entity";
import { Repository } from "typeorm";

@Injectable()
export class ChamadaService {
    constructor(
        @InjectRepository(Chamada)
        private readonly chamadaRepository: Repository<Chamada>
    ) { }
    /**
     * Retorna um objeto de atendimento que será chamado quando disponível e iniciado,
     * os atendimentos são realizados de forma assíncrona e em filas de acordo com 
     * configuirações de disponibilidade de recursos. As filas podem ser manipuladas
     * em contextos restritos. Apenas usuários gestores do número da fila é capaz de alterar
     * a ordem dos atendimentos.
     * 
     */
    async IniciarChamada() {

    }

    async FinalizarChamada() {

    }

    async AbrirNovaSessao() {

    }
}