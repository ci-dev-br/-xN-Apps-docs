import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Register } from "../models/register.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class RegisterService {
    constructor(
        @InjectRepository(Register)
        private readonly repo: Repository<Register>,
    ) { }
    async register(register: Register) {
        return this.repo.save(this.repo.create(register));
    }
}