import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Product } from "../models/produto.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ProdutoService {
    constructor(
        @InjectRepository(Product)
        private readonly repo: Repository<Product>,
    ) { }

    /**
     * Sincronizar objeto
     * @param data 
     * @returns 
     */
    async sync(data: Product) {
        let { id, ...changes } = data;
        let data_ref = !!data.id ? await this.repo.findOneBy({ id: data.id }) : await this.repo.create(data);
        Object.assign(data_ref, changes);
        return await this.repo.save(data_ref);
    }

    async listar(
        options: {
            offset: number,
            size: number,
        }
    ) {

    }
}