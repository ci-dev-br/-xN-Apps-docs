import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Icon } from "../models/icon.entity";
import { InjectRepository } from "@nestjs/typeorm";

/***
 *  Serviços de catálogo para ícones do sistema
 * 
 */
@Injectable()
export class IconsServices {
    constructor(
        @InjectRepository(Icon)
        private readonly repo: Repository<Icon>
    ) { }

    /**
     * Retorna lista de ícones catalogados
     */
    async obterIcones() {
        return await this.repo.findAndCount();
    }
}