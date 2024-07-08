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
}