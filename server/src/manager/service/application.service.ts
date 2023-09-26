import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Application } from "../model/application.entity";
import { Repository } from "typeorm";

@Injectable()
export class ApplicationService {
    constructor(
        @InjectRepository(Application)
        private readonly repo: Repository<Application>,
    ) { }

    async find() {
        return this.repo.find({
            where: {}
        })
    }
}