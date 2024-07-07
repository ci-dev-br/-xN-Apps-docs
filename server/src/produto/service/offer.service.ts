import { Injectable } from "@nestjs/common";
import { ILike, In, Repository } from "typeorm";
import { Product } from "../models/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IAutentication } from "@ci/core"

export interface IOptions {
    offset?: number;
    limit?: number;
    query?: string;
    autentication?: IAutentication;
}

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
    async sync(input: Product) {
        let data = (await this.repo.findOneBy({ internalId: input.internalId })) || this.repo.create();
        data
        if ('gtin' in input) data.gtin = input.gtin;
        if ('codigoBarras' in input) data.codigoBarras = input.codigoBarras;
        if ('description' in input) data.description = input.description;
        if ('shortDescription' in input) data.shortDescription = input.shortDescription;
        if ('urlWebsiteOficial' in input) data.urlWebsiteOficial = input.urlWebsiteOficial;
        return await this.repo.save(data)
    }
    async listar(
        options?: IOptions
    ) {
        this.repo.find({
            where: [
                {
                    gtin: options.query ? ILike(options.query) : undefined,
                    tenants: In(options.autentication.tenants)
                },
                {
                    description: options.query ? ILike(options.query) : undefined,
                    tenants: In(options.autentication.tenants)
                },
            ],
            skip: options.offset,
            cache: true,
            comment: "[USER::]",
            take: options.limit
        })
    }
}