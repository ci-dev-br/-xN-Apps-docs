import { Repository } from "typeorm";
import { Sale } from "../model/sale";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SaleService {
    constructor(
        private readonly repo: Repository<Sale>
    ) { }

    async create() { }
    async sync() { }
    async getAll() { }
}